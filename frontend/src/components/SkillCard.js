import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Avatar,
  Box
} from '@mui/material';
import { LocationOn, AccessTime, MonetizationOn } from '@mui/icons-material';

const SkillCard = ({ skill, onBook, onViewDetails }) => {
  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'info';
      case 'expert': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ mr: 2 }}>
            {skill.user_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {skill.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {skill.user_name}
            </Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Chip
            label={skill.category}
            color="primary"
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label={skill.proficiency_level}
            color={getProficiencyColor(skill.proficiency_level)}
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {skill.description}
        </Typography>

        <Box display="flex" alignItems="center" mb={1}>
          <LocationOn fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {skill.user_location}
          </Typography>
        </Box>

        {skill.price_per_hour && (
          <Box display="flex" alignItems="center" mb={1}>
            <MonetizationOn fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              ${skill.price_per_hour}/hour
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center">
          <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {skill.is_available ? 'Available' : 'Currently Unavailable'}
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={() => onViewDetails(skill)}>
          View Details
        </Button>
        {skill.is_available && (
          <Button size="small" color="primary" onClick={() => onBook(skill)}>
            Book Session
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default SkillCard;