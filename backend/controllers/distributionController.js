const nodemailer = require('nodemailer');
const Project = require('../models/Project');
const Minutes = require('../models/Minutes');
const Recording = require('../models/Recording');

// Configure email transport
const getEmailTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASSWORD || 'password'
    }
  });
};

// Get distribution settings for a project
exports.getDistributionSettings = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const settings = {
      emailDistribution: project.emailDistribution || '',
      autoDistribution: project.autoDistribution || {
        enabled: false,
        scheduleType: 'immediate',
        time: '09:00'
      }
    };
    
    res.json(settings);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update distribution settings for a project
exports.updateDistributionSettings = async (req, res) => {
  try {
    const { emailDistribution, autoDistribution } = req.body;
    
    // Build update object
    const updateFields = {};
    if (emailDistribution !== undefined) updateFields.emailDistribution = emailDistribution;
    if (autoDistribution) updateFields.autoDistribution = autoDistribution;
    
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { $set: updateFields },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({
      message: 'Distribution settings updated',
      settings: {
        emailDistribution: project.emailDistribution,
        autoDistribution: project.autoDistribution
      }
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending minutes for distribution
exports.getPendingMinutes = async (req, res) => {
  try {
    const pendingMinutes = await Minutes.find({ emailSent: false })
      .populate('projectId', 'name emailDistribution')
      .sort({ date: -1 });
    
    res.json(pendingMinutes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send meeting minutes
exports.sendMinutes = async (req, res) => {
  try {
    const { minutesId, recipients } = req.body;
    
    // Get minutes
    const minutes = await Minutes.findById(minutesId);
    if (!minutes) {
      return res.status(404).json({ message: 'Meeting minutes not found' });
    }
    
    // Get project
    const project = await Project.findById(minutes.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Get recording if available
    let recording = null;
    if (minutes.recordingId) {
      recording = await Recording.findById(minutes.recordingId);
    }
    
    // Determine recipients
    const emailRecipients = recipients || project.emailDistribution;
    if (!emailRecipients) {
      return res.status(400).json({ message: 'No recipients specified' });
    }
    
    // Create email content
    const emailSubject = `Meeting Minutes: ${minutes.name} - ${new Date(minutes.date).toLocaleDateString()}`;
    
    let emailContent = `
      <h2>${minutes.name}</h2>
      <p><strong>Date:</strong> ${new Date(minutes.date).toLocaleDateString()}</p>
      
      ${minutes.attendees && minutes.attendees.length > 0 ? 
        `<p><strong>Attendees:</strong> ${minutes.attendees.join(', ')}</p>` : ''}
      
      ${minutes.summary ? `<h3>Summary</h3><p>${minutes.summary}</p>` : ''}
      
      <h3>Meeting Notes</h3>
      <div>${minutes.content}</div>
      
      ${minutes.actionItems && minutes.actionItems.length > 0 ? 
        `<h3>Action Items</h3>
        <ul>
          ${minutes.actionItems.map(item => `
            <li>
              <strong>${item.description}</strong>
              ${item.assignee ? ` - Assigned to: ${item.assignee}` : ''}
              ${item.dueDate ? ` - Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}
              ${item.status ? ` - Status: ${item.status}` : ''}
            </li>
          `).join('')}
        </ul>` : ''}
      
      ${minutes.nextSync ? `<p><strong>Next Meeting:</strong> ${minutes.nextSync}</p>` : ''}
      
      ${recording ? `<p><strong>Recording:</strong> <a href="${recording.url}">View Recording</a></p>` : ''}
    `;
    
    // Send email
    const transporter = getEmailTransport();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'pm@cloudwarriors.com',
      to: emailRecipients,
      subject: emailSubject,
      html: emailContent
    };
    
    await transporter.sendMail(mailOptions);
    
    // Update minutes as sent
    minutes.emailSent = true;
    await minutes.save();
    
    res.json({
      message: 'Meeting minutes sent successfully',
      recipients: emailRecipients.split(',').map(email => email.trim())
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error sending meeting minutes',
      error: err.message
    });
  }
};

// Process all pending minutes
exports.processAllPendingMinutes = async (req, res) => {
  try {
    const pendingMinutes = await Minutes.find({ emailSent: false })
      .populate('projectId', 'name emailDistribution autoDistribution');
    
    const results = {
      total: pendingMinutes.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    // Process each minutes
    for (const minutes of pendingMinutes) {
      // Skip if project doesn't have auto distribution enabled
      if (!minutes.projectId.autoDistribution || !minutes.projectId.autoDistribution.enabled) {
        results.skipped++;
        results.details.push({
          minutesId: minutes._id,
          name: minutes.name,
          status: 'skipped',
          reason: 'Auto distribution not enabled for project'
        });
        continue;
      }
      
      // Skip if no recipients
      if (!minutes.projectId.emailDistribution) {
        results.skipped++;
        results.details.push({
          minutesId: minutes._id,
          name: minutes.name,
          status: 'skipped',
          reason: 'No recipients specified for project'
        });
        continue;
      }
      
      try {
        // Get recording if available
        let recording = null;
        if (minutes.recordingId) {
          recording = await Recording.findById(minutes.recordingId);
        }
        
        // Create email content
        const emailSubject = `Meeting Minutes: ${minutes.name} - ${new Date(minutes.date).toLocaleDateString()}`;
        
        let emailContent = `
          <h2>${minutes.name}</h2>
          <p><strong>Date:</strong> ${new Date(minutes.date).toLocaleDateString()}</p>
          
          ${minutes.attendees && minutes.attendees.length > 0 ? 
            `<p><strong>Attendees:</strong> ${minutes.attendees.join(', ')}</p>` : ''}
          
          ${minutes.summary ? `<h3>Summary</h3><p>${minutes.summary}</p>` : ''}
          
          <h3>Meeting Notes</h3>
          <div>${minutes.content}</div>
          
          ${minutes.actionItems && minutes.actionItems.length > 0 ? 
            `<h3>Action Items</h3>
            <ul>
              ${minutes.actionItems.map(item => `
                <li>
                  <strong>${item.description}</strong>
                  ${item.assignee ? ` - Assigned to: ${item.assignee}` : ''}
                  ${item.dueDate ? ` - Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}
                  ${item.status ? ` - Status: ${item.status}` : ''}
                </li>
              `).join('')}
            </ul>` : ''}
          
          ${minutes.nextSync ? `<p><strong>Next Meeting:</strong> ${minutes.nextSync}</p>` : ''}
          
          ${recording ? `<p><strong>Recording:</strong> <a href="${recording.url}">View Recording</a></p>` : ''}
        `;
        
        // Send email
        const transporter = getEmailTransport();
        
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'pm@cloudwarriors.com',
          to: minutes.projectId.emailDistribution,
          subject: emailSubject,
          html: emailContent
        };
        
        await transporter.sendMail(mailOptions);
        
        // Update minutes as sent
        minutes.emailSent = true;
        await minutes.save();
        
        results.sent++;
        results.details.push({
          minutesId: minutes._id,
          name: minutes.name,
          status: 'sent',
          recipients: minutes.projectId.emailDistribution.split(',').map(email => email.trim())
        });
      } catch (err) {
        console.error(`Error sending minutes ${minutes._id}:`, err);
        results.failed++;
        results.details.push({
          minutesId: minutes._id,
          name: minutes.name,
          status: 'failed',
          error: err.message
        });
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Error processing pending minutes',
      error: err.message
    });
  }
};
