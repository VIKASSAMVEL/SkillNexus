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
import StarRating from './StarRating';
import { formatCurrency } from '../utils/formatters';

const SkillCard = ({ skill, onBook, onViewDetails }) => {
  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner': return '#06B6D4';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#8B5CF6';
      case 'expert': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#1A2332',
      border: '1px solid #1E293B',
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: '#14B8A6',
        boxShadow: '0 8px 24px rgba(20, 184, 166, 0.15)',
        transform: 'translateY(-4px)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" alignItems="center" mb={2.5}>
          <Avatar sx={{ 
            mr: 2,
            bgcolor: '#0F766E',
            color: '#14B8A6',
            fontWeight: 600
          }}>
            {skill.user_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" component="div" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
              {skill.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              by {skill.user_name}
            </Typography>
          </Box>
        </Box>

        <Box mb={2.5} display="flex" gap={1} flexWrap="wrap">
          <Chip
            label={skill.category}
            size="small"
            sx={{ 
              bgcolor: '#0F766E',
              color: '#14B8A6',
              fontWeight: 600,
              border: '1px solid #14B8A6'
            }}
          />
          <Chip
            label={skill.proficiency_level.charAt(0).toUpperCase() + skill.proficiency_level.slice(1)}
            size="small"
            sx={{
              bgcolor: getProficiencyColor(skill.proficiency_level) + '15',
              color: getProficiencyColor(skill.proficiency_level),
              border: `1px solid ${getProficiencyColor(skill.proficiency_level)}`,
              fontWeight: 600
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 2.5, lineHeight: 1.5 }}>
          {skill.description}
        </Typography>

        <Box display="flex" alignItems="center" mb={1.5}>
          <LocationOn fontSize="small" sx={{ mr: 0.8, color: '#14B8A6', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
            {skill.user_location}
          </Typography>
        </Box>

        {skill.price_per_hour && (
          <Box display="flex" alignItems="center" mb={1.5}>
            <MonetizationOn fontSize="small" sx={{ mr: 0.8, color: '#14B8A6', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: '#CBD5E1', fontWeight: 600 }}>
              {formatCurrency(skill.price_per_hour)}/hour
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center">
          <AccessTime fontSize="small" sx={{ mr: 0.8, color: '#14B8A6', flexShrink: 0 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: skill.is_available ? '#10B981' : '#EF4444',
              fontWeight: 600
            }}
          >
            {skill.is_available ? '✓ Available' : '✗ Unavailable'}
          </Typography>
        </Box>

        {/* Reputation Section */}
        <Box mt={1.5} p={1.5} sx={{ bgcolor: 'rgba(20, 184, 166, 0.05)', borderRadius: 1, border: '1px solid rgba(20, 184, 166, 0.2)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <StarRating rating={skill.average_rating || 0} size="small" showValue={false} />
            <Typography variant="body2" sx={{ color: '#14B8A6', fontWeight: 600 }}>
              {Number(skill.average_rating || 0)?.toFixed(1) || '0.0'}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
            {skill.rating_count || 0} reviews • Trust Score: {Number(skill.trust_score || 3.0)?.toFixed(1) || '3.0'}/5.0
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0, pb: 1.5, gap: 1 }}>
        <Button 
          size="small" 
          onClick={() => onViewDetails(skill)}
          sx={{
            color: '#14B8A6',
            fontWeight: 600,
            '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.1)' }
          }}
        >
          View Details
        </Button>
        {skill.is_available && (
          <Button 
            size="small" 
            onClick={() => onBook(skill)}
            sx={{
              bgcolor: '#0F766E',
              color: '#14B8A6',
              fontWeight: 600,
              '&:hover': { 
                bgcolor: '#14B8A6',
                color: '#0F172A'
              }
            }}
          >
            Book Session
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default SkillCard;