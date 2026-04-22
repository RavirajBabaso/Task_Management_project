import * as cron from 'node-cron';

const weeklyReportJob = cron.schedule('0 7 * * 1', async () => {
  console.log('Running weekly report job at 7 AM on Monday');
  try {
    // TODO: Implement weekly report generation
    console.log('Weekly report generation triggered');
  } catch (error) {
    console.error('Error in weekly report job:', error);
  }
}, {
  scheduled: false, // Don't start automatically
});

export default weeklyReportJob;