import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Assignment as CarePlanIcon } from '@mui/icons-material';

const CarePlans: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CarePlanIcon sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Care Plans
        </Typography>
      </Box>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Care Plans Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This feature is being implemented. Care plans will allow you to create and manage individualized care plans for residents with goals and progress tracking.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CarePlans;




