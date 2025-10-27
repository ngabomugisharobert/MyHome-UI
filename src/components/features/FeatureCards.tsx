import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';
import {
  Group as TeamIcon,
  PersonAdd as RoleIcon,
  Security as AccessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  color,
}) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      },
    }}
  >
    <CardContent sx={{ flexGrow: 1, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${color}.light`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="h2" fontWeight="bold" color="text.primary">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {description}
      </Typography>
    </CardContent>
    <CardActions sx={{ p: 3, pt: 0 }}>
      <Button
        variant="contained"
        onClick={onButtonClick}
        sx={{
          backgroundColor: color,
          '&:hover': {
            backgroundColor: `${color}.dark`,
          },
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1,
        }}
      >
        {buttonText}
      </Button>
    </CardActions>
  </Card>
);

const FeatureCards: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TeamIcon sx={{ color: 'success.main', fontSize: 28 }} />,
      title: 'Manage your Team',
      description: 'Invite a new member, inactivate it, add details, check timesheet and from where he signed up in Synkwise. Run different reports to help you to manage better your team.',
      buttonText: 'Manage Team',
      color: 'success',
      onButtonClick: () => navigate('/team-management'),
    },
    {
      icon: <RoleIcon sx={{ color: 'primary.main', fontSize: 28 }} />,
      title: 'Setup a new Role',
      description: 'Configure different types of accounts: Resident Manager, Caregiver, Licensor or a Family member, or even your own role according to your workflow. For each role you can configure the access to a specific functionality.',
      buttonText: 'Setup Roles',
      color: 'primary',
      onButtonClick: () => navigate('/role-management'),
    },
    {
      icon: <AccessIcon sx={{ color: 'warning.main', fontSize: 28 }} />,
      title: 'Configure Access',
      description: 'Configure the access for each team member. For example a caregiver can have access to a specific facility and to a specific resident, or the family member can access only a specific resident.',
      buttonText: 'Configure Access',
      color: 'warning',
      onButtonClick: () => navigate('/access-management'),
    },
  ];

  return (
    <Grid container spacing={3}>
      {features.map((feature, index) => (
        <Grid item xs={12} md={4} key={index}>
          <FeatureCard {...feature} />
        </Grid>
      ))}
    </Grid>
  );
};

export default FeatureCards;
