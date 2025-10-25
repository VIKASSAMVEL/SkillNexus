import React from 'react';
import { Typography, Container, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Welcome to Urban Skill Exchange
      </Typography>
      <Typography variant="h5" component="p" gutterBottom align="center" color="text.secondary">
        Connect with local talent, share skills, and build community projects
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Find Skills
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover and connect with skilled individuals in your neighborhood
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/skills">Browse Skills</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Share Your Skills
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offer your expertise and help others learn new things
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/register">Get Started</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Community Projects
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join or create collaborative projects for community benefit
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/projects">Explore Projects</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;