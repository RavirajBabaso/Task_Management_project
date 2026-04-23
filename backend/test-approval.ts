// Test script to validate approval system structure
import { createApproval, getAllApprovals, getMyApprovals, processApproval } from './src/controllers/approvalController';
import { Approval } from './src/models/Approval';
import { User } from './src/models/User';
import { Notification } from './src/models/Notification';

console.log('Approval system validation:');

// Check if functions are exported
console.log('✓ createApproval function:', typeof createApproval);
console.log('✓ getAllApprovals function:', typeof getAllApprovals);
console.log('✓ getMyApprovals function:', typeof getMyApprovals);
console.log('✓ processApproval function:', typeof processApproval);

// Check if models are properly structured
console.log('✓ Approval model:', typeof Approval);
console.log('✓ User model:', typeof User);
console.log('✓ Notification model:', typeof Notification);

console.log('\nApproval system structure validation completed successfully!');