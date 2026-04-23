import * as cron from 'node-cron';

const dailyReportJob = cron.schedule('0 6 * * *', async () => {
  console.log('Running daily report job at 6 AM');
  try {
    // TODO: Implement daily report generation
    console.log('Daily report generation triggered');
  } catch (error) {
    console.error('Error in daily report job:', error);
  }
});

export default dailyReportJob;