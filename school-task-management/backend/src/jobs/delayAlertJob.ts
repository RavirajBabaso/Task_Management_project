import * as cron from 'node-cron';
import { checkDelayedTasks } from '../services/alertService';
import { escalateDelayedTasks } from '../services/escalationService';

const delayAlertJob = cron.schedule('0 0 * * *', async () => {
  console.log('Running delay alert job at midnight');
  try {
    await checkDelayedTasks();
    await escalateDelayedTasks();
  } catch (error) {
    console.error('Error in delay alert job:', error);
  }
}, {
  scheduled: false, // Don't start automatically
});

export default delayAlertJob;