import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Save as SaveIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    postScheduledNotifications: true,
    postPublishedNotifications: true,
    weeklyReportNotifications: true,
  });
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // In a real application, these would be actual API calls
        // const profileResponse = await axios.get('/api/user/profile');
        // setProfileData(profileResponse.data);
        
        // const notificationsResponse = await axios.get('/api/user/notifications');
        // setNotificationSettings(notificationsResponse.data);
        
        // const socialAccountsResponse = await axios.get('/api/user/social-accounts');
        // setSocialAccounts(socialAccountsResponse.data);
        
        // Simulate data for development
        setTimeout(() => {
          setProfileData({
            name: currentUser?.name || 'John Doe',
            email: currentUser?.email || 'john.doe@example.com',
            bio: 'Digital marketing specialist with 5+ years of experience in social media management and content creation.',
            profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
          });
          
          setNotificationSettings({
            emailNotifications: true,
            postScheduledNotifications: true,
            postPublishedNotifications: true,
            weeklyReportNotifications: true,
          });
          
          setSocialAccounts([
            {
              id: 1,
              platform: 'instagram',
              username: 'marketingpro',
              connected: true,
              lastSync: '2023-05-15T10:30:00Z',
            },
            {
              id: 2,
              platform: 'twitter',
              username: 'marketingpro',
              connected: true,
              lastSync: '2023-05-15T10:30:00Z',
            },
            {
              id: 3,
              platform: 'facebook',
              username: 'Marketing Pro',
              connected: false,
              lastSync: null,
            },
            {
              id: 4,
              platform: 'linkedin',
              username: 'marketing-professional',
              connected: true,
              lastSync: '2023-05-15T10:30:00Z',
            },
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // In a real application, this would be an API call
      // await axios.put('/api/user/profile', profileData);
      
      // Simulate API call for development
      setTimeout(() => {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success',
        });
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Error updating profile. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleSavePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match.',
        severity: 'error',
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password should be at least 6 characters long.',
        severity: 'error',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real application, this would be an API call
      // await axios.put('/api/user/password', passwordData);
      
      // Simulate API call for development
      setTimeout(() => {
        setLoading(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setSnackbar({
          open: true,
          message: 'Password updated successfully!',
          severity: 'success',
        });
      }, 1000);
    } catch (error) {
      console.error('Error updating password:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Error updating password. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      
      // In a real application, this would be an API call
      // await axios.put('/api/user/notifications', notificationSettings);
      
      // Simulate API call for development
      setTimeout(() => {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Notification settings updated successfully!',
          severity: 'success',
        });
      }, 1000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Error updating notification settings. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleConnectSocialAccount = async (platform) => {
    try {
      setLoading(true);
      
      // In a real application, this would redirect to OAuth flow
      // window.location.href = `/api/auth/${platform}`;
      
      // Simulate API call for development
      setTimeout(() => {
        const updatedAccounts = socialAccounts.map(account => {
          if (account.platform === platform) {
            return {
              ...account,
              connected: true,
              lastSync: new Date().toISOString(),
            };
          }
          return account;
        });
        
        setSocialAccounts(updatedAccounts);
        setLoading(false);
        setSnackbar({
          open: true,
          message: `Connected to ${platform} successfully!`,
          severity: 'success',
        });
      }, 1000);
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: `Error connecting to ${platform}. Please try again.`,
        severity: 'error',
      });
    }
  };

  const handleDisconnectSocialAccount = async (platform) => {
    try {
      setLoading(true);
      
      // In a real application, this would be an API call
      // await axios.delete(`/api/user/social-accounts/${platform}`);
      
      // Simulate API call for development
      setTimeout(() => {
        const updatedAccounts = socialAccounts.map(account => {
          if (account.platform === platform) {
            return {
              ...account,
              connected: false,
              lastSync: null,
            };
          }
          return account;
        });
        
        setSocialAccounts(updatedAccounts);
        setLoading(false);
        setSnackbar({
          open: true,
          message: `Disconnected from ${platform} successfully!`,
          severity: 'success',
        });
      }, 1000);
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: `Error disconnecting from ${platform}. Please try again.`,
        severity: 'error',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setSnackbar({
        open: true,
        message: 'Please type DELETE to confirm account deletion.',
        severity: 'error',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real application, this would be an API call
      // await axios.delete('/api/user/account');
      
      // Simulate API call for development
      setTimeout(() => {
        setLoading(false);
        setDeleteAccountDialogOpen(false);
        setDeleteConfirmText('');
        
        // Log out the user
        logout();
        
        // In a real application, this would redirect to the login page
        // window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Error deleting account. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon sx={{ color: '#E1306C' }} />;
      case 'twitter':
        return <TwitterIcon sx={{ color: '#1DA1F2' }} />;
      case 'facebook':
        return <FacebookIcon sx={{ color: '#4267B2' }} />;
      case 'linkedin':
        return <LinkedInIcon sx={{ color: '#0077B5' }} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const options = { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading && !profileData.name) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Profile" icon={<EditIcon />} iconPosition="start" />
          <Tab label="Social Accounts" icon={<InstagramIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Profile Settings */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative', mr: 3 }}>
              <Avatar
                src={profileData.profileImage}
                alt={profileData.name}
                sx={{ width: 100, height: 100 }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
                size="small"
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h5">{profileData.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.email}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                margin="normal"
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Social Accounts Settings */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Connected Social Media Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Connect your social media accounts to schedule and publish posts directly from the platform.
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <List>
            {socialAccounts.map((account) => (
              <ListItem key={account.id} divider>
                <ListItemIcon>
                  {getPlatformIcon(account.platform)}
                </ListItemIcon>
                <ListItemText
                  primary={account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                  secondary={
                    account.connected
                      ? `Connected as @${account.username} • Last synced: ${formatDate(account.lastSync)}`
                      : 'Not connected'
                  }
                />
                <ListItemSecondaryAction>
                  {account.connected ? (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDisconnectSocialAccount(account.platform)}
                      disabled={loading}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleConnectSocialAccount(account.platform)}
                      disabled={loading}
                    >
                      Connect
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Notification Settings */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage how and when you receive notifications from the platform.
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              Receive notifications via email.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.postScheduledNotifications}
                  onChange={handleNotificationChange}
                  name="postScheduledNotifications"
                  color="primary"
                />
              }
              label="Post Scheduled Notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              Receive notifications when a post is scheduled.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.postPublishedNotifications}
                  onChange={handleNotificationChange}
                  name="postPublishedNotifications"
                  color="primary"
                />
              }
              label="Post Published Notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              Receive notifications when a post is published.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.weeklyReportNotifications}
                  onChange={handleNotificationChange}
                  name="weeklyReportNotifications"
                  color="primary"
                />
              }
              label="Weekly Report Notifications"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              Receive weekly performance reports.
            </Typography>
          </FormGroup>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveNotifications}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Security Settings */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}
                  onClick={handleSavePassword}
                  disabled={loading}
                >
                  Update Password
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ bgcolor: '#fff8f8' }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Delete Account
              </Typography>
              <Typography variant="body2" paragraph>
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteAccountDialogOpen(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Paper>
      )}
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteAccountDialogOpen}
        onClose={() => setDeleteAccountDialogOpen(false)}
        aria-labelledby="delete-account-dialog-title"
        aria-describedby="delete-account-dialog-description"
      >
        <DialogTitle id="delete-account-dialog-title" color="error">
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-account-dialog-description">
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
            To confirm, type "DELETE" in the field below:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            disabled={deleteConfirmText !== 'DELETE' || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 