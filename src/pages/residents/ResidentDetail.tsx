import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Breadcrumbs,
  Link,
  CircularProgress,
  Grid,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Button,
  Stack,
} from '@mui/material';
import {
  Person,
  Description,
  Contacts as ContactsIcon,
  Medication as MedicationIcon,
  LocalHospital,
  Assessment,
  Assignment,
  Note,
  Receipt,
  ArrowBack,
  Menu as MenuIcon,
  QueryStats,
  Print,
  Send,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ResidentInfo from '../../components/residents/ResidentInfo';
import ResidentDocuments from '../../components/residents/ResidentDocuments';
import ResidentContacts from '../../components/residents/ResidentContacts';
import ResidentMedications from '../../components/residents/ResidentMedications';
import ResidentCarePlans from '../../components/residents/ResidentCarePlans';
import ResidentAssessments from '../../components/residents/ResidentAssessments';
import ResidentReports from '../../components/residents/ResidentReports';
import ResidentNotes from '../../components/residents/ResidentNotes';
import ResidentForms from '../../components/residents/ResidentForms';
import ResidentProfileSidebar from '../../components/residents/ResidentProfileSidebar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resident-tabpanel-${index}`}
      aria-labelledby={`resident-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ResidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [careTeam, setCareTeam] = useState<any[]>([]);

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const response = await api.get(`/residents/${id}`);
        if (response.data.success) {
          setResident(response.data.data.resident);
        }
      } catch (error) {
        console.error('Failed to fetch resident:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCareTeam = async () => {
      try {
        if (!id) return;
        const response = await api.get(`/contacts/resident/${id}`);
        if (response.data.success) {
          setCareTeam(response.data.data.contacts?.slice(0, 6) || []);
        }
      } catch (e) {
        // non-blocking
        setCareTeam([]);
      }
    };

    if (id) {
      fetchResident();
      fetchCareTeam();
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!resident) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">Resident not found</Typography>
      </Box>
    );
  }

  // Tabs: add Health Monitor
  const tabs = [
    { label: 'Profile', icon: <Person />, index: 0 },
    { label: 'Documents', icon: <Description />, index: 1 },
    { label: 'Contacts', icon: <ContactsIcon />, index: 2 },
    { label: 'Medications', icon: <MedicationIcon />, index: 3 },
    { label: 'Care Plans', icon: <LocalHospital />, index: 4 },
    { label: 'Health Monitor', icon: <QueryStats />, index: 5 },
    { label: 'Assessments', icon: <Assessment />, index: 6 },
    { label: 'Reports', icon: <Assignment />, index: 7 },
    { label: 'Notes', icon: <Note />, index: 8 },
    { label: 'Forms', icon: <Receipt />, index: 9 },
  ];

  const goToTab = (idx: number) => setTabValue(idx);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Breadcrumb Header - Fixed below AppBar */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider', 
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0, // Sticks to top of scrollable container
          zIndex: 1100, // Below AppBar but above content
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/facility/residents')}>
            <ArrowBack />
          </IconButton>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </IconButton>
          )}
          <Breadcrumbs>
            <Link
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/facility/residents');
              }}
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Residents
            </Link>
            <Typography color="text.primary">
              {resident.firstName} {resident.lastName}
            </Typography>
          </Breadcrumbs>
          {/* Care team avatars */}
          <Stack direction="row" spacing={-0.5} sx={{ ml: 'auto', mr: 1, display: { xs: 'none', md: 'flex' } }}>
            {careTeam.map((c, i) => (
              <Avatar key={i} sx={{ width: 28, height: 28, border: '2px solid', borderColor: 'background.paper' }}>
                {(c.name || c.firstName)?.charAt(0)?.toUpperCase()}
              </Avatar>
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<Print />} variant="outlined">Print</Button>
            <Button size="small" startIcon={<Send />} variant="outlined">Send By</Button>
          </Stack>
        </Box>
        {/* Quick actions toolbar */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button size="small" onClick={() => goToTab(0)} startIcon={<Person />}>Profile</Button>
          <Button size="small" onClick={() => goToTab(2)} startIcon={<ContactsIcon />}>Contacts</Button>
          <Button size="small" onClick={() => goToTab(6)} startIcon={<Assessment />}>Assessments</Button>
          <Button size="small" onClick={() => goToTab(4)} startIcon={<LocalHospital />}>Care Plans</Button>
          <Button size="small" onClick={() => goToTab(5)} startIcon={<QueryStats />}>Health Monitor</Button>
          <Button size="small" onClick={() => goToTab(1)} startIcon={<Description />}>Documents</Button>
          <Button size="small" onClick={() => goToTab(3)} startIcon={<MedicationIcon />}>Medications</Button>
          <Button size="small" onClick={() => goToTab(8)} startIcon={<Note />}>Notes</Button>
          <Button size="small" onClick={() => goToTab(9)} startIcon={<Receipt />}>Forms</Button>
          <Button size="small" onClick={() => goToTab(7)} startIcon={<Assignment />}>Reports</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Sidebar */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            width: 320,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 320,
              boxSizing: 'border-box',
              position: 'relative',
              height: '100%',
              borderRight: 1,
              borderColor: 'divider',
              zIndex: 1000, // Below breadcrumb
              top: 0,
              overflowY: 'auto',
            },
          }}
        >
          <ResidentProfileSidebar resident={resident} />
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="resident detail tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.index}
                  icon={tab.icon}
                  iconPosition="start"
                  label={tab.label}
                  id={`resident-tab-${tab.index}`}
                  aria-controls={`resident-tabpanel-${tab.index}`}
                />
              ))}
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <TabPanel value={tabValue} index={0}>
                <ResidentInfo resident={resident} />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <ResidentDocuments residentId={resident.id} />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <ResidentContacts residentId={resident.id} />
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                <ResidentMedications residentId={resident.id} />
              </TabPanel>
              <TabPanel value={tabValue} index={4}>
                <ResidentCarePlans residentId={resident.id} />
              </TabPanel>
              <TabPanel value={tabValue} index={5}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Health Monitor</Typography>
                  <Typography variant="body2" color="text.secondary">Vital Parameters and Vital Statistics coming soon.</Typography>
                </Box>
              </TabPanel>
              <TabPanel value={tabValue} index={6}>
                <ResidentAssessments residentId={resident.id} />
              </TabPanel>
              <TabPanel value={tabValue} index={7}>
                <ResidentReports residentId={resident.id} />
              </TabPanel>
              <TabPanel value={tabValue} index={8}>
                <ResidentNotes residentId={resident.id} />
              </TabPanel>
              <TabPanel value={tabValue} index={9}>
                <ResidentForms residentId={resident.id} />
              </TabPanel>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ResidentDetail;
