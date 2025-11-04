import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { CalendarToday as ScheduleIcon } from '@mui/icons-material';

const Schedules: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ScheduleIcon sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Schedules
        </Typography>
      </Box>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Scheduling System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This feature is being implemented. The scheduling system will allow you to manage staff shifts, appointments, and resident schedules.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Schedules;




