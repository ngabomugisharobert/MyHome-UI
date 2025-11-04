import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FacilityResidents from '../FacilityResidents';
import { AuthContext } from '../../../contexts/AuthContext';
import { ToastContext } from '../../../contexts/ToastContext';
import api from '../../../services/api';

// Mock API
jest.mock('../../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth context
const mockUser = {
  id: 'user-123',
  email: 'admin@test.com',
  name: 'Test Admin',
  role: 'admin',
  facilityId: 'facility-123',
};

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  tokens: { accessToken: 'token', refreshToken: 'refresh' },
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
  isSessionExpired: false,
};

// Mock toast context
const mockToastContext = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showInfo: jest.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext as any}>
        <ToastContext.Provider value={mockToastContext as any}>
          {ui}
        </ToastContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('FacilityResidents Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          residents: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 }
        }
      }
    });
    mockApi.post.mockResolvedValue({ data: { success: true } });
    mockApi.put.mockResolvedValue({ data: { success: true } });
    mockApi.delete.mockResolvedValue({ data: { success: true } });
  });

  describe('Loading and Empty States', () => {
    test('should show loading state initially', async () => {
      mockApi.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<FacilityResidents />);
      
      // Should show loading indicator
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('should show empty state when no residents', async () => {
      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        expect(screen.getByText(/No residents found/i)).toBeInTheDocument();
        expect(screen.getByText(/Get started by adding your first resident/i)).toBeInTheDocument();
        expect(screen.getByText(/Add First Resident/i)).toBeInTheDocument();
      });
    });

    test('should show error state and retry button', async () => {
      mockApi.get.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } });
      
      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load residents/i)).toBeInTheDocument();
        expect(screen.getByText(/Retry/i)).toBeInTheDocument();
      });
    });
  });

  describe('Create Resident', () => {
    test('should open create dialog', async () => {
      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Resident/i);
        fireEvent.click(addButton);
      });

      expect(screen.getByText(/Add New Resident/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    });

    test('should validate required fields', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            residents: [
              {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                status: 'active',
                facilityId: 'facility-123'
              }
            ],
            pagination: { total: 1, page: 1, limit: 10, pages: 1 }
          }
        }
      });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Resident/i);
        fireEvent.click(addButton);
      });

      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockToastContext.showError).toHaveBeenCalledWith(
          'First name and last name are required'
        );
      });
    });

    test('should create resident with valid data', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            residents: [],
            pagination: { total: 0, page: 1, limit: 10, pages: 0 }
          }
        }
      });

      // Mock physicians endpoint
      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            physicians: [
              { id: 'doc-1', name: 'Dr. Smith', email: 'dr.smith@test.com' }
            ]
          }
        }
      });

      mockApi.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { resident: { id: 'new-resident', firstName: 'John', lastName: 'Doe' } }
        }
      });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Resident/i);
        fireEvent.click(addButton);
      });

      // Fill form
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          '/residents',
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe'
          })
        );
        expect(mockToastContext.showSuccess).toHaveBeenCalledWith(
          'Resident created successfully'
        );
      });
    });
  });

  describe('Primary Physician Dropdown', () => {
    test('should fetch and display physicians', async () => {
      mockApi.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              residents: [],
              pagination: { total: 0, page: 1, limit: 10, pages: 0 }
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              physicians: [
                { id: 'doc-1', name: 'Dr. Smith', email: 'dr.smith@test.com' },
                { id: 'doc-2', name: 'Dr. Jones', email: 'dr.jones@test.com' }
              ]
            }
          }
        });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Resident/i);
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/residents/physicians');
        expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
        expect(screen.getByText(/Dr. Jones/i)).toBeInTheDocument();
      });
    });

    test('should show "None" option for primary physician', async () => {
      mockApi.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              residents: [],
              pagination: { total: 0, page: 1, limit: 10, pages: 0 }
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { physicians: [] }
          }
        });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Resident/i);
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/None \(Can be added later\)/i)).toBeInTheDocument();
      });
    });

    test('should allow selecting physician from dropdown', async () => {
      mockApi.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              residents: [],
              pagination: { total: 0, page: 1, limit: 10, pages: 0 }
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              physicians: [
                { id: 'doc-1', name: 'Dr. Smith', email: 'dr.smith@test.com' }
              ]
            }
          }
        });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Resident/i);
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const physicianSelect = screen.getByLabelText(/Primary Physician/i);
        fireEvent.mouseDown(physicianSelect);
        
        const option = screen.getByText(/Dr. Smith/i);
        fireEvent.click(option);
      });

      // Verify selection
      expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
    });
  });

  describe('Edit Resident', () => {
    test('should populate form when editing', async () => {
      const resident = {
        id: 'resident-1',
        firstName: 'John',
        lastName: 'Doe',
        dob: '1950-01-15',
        gender: 'male',
        roomNumber: '101',
        status: 'active',
        facilityId: 'facility-123'
      };

      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            residents: [resident],
            pagination: { total: 1, page: 1, limit: 10, pages: 1 }
          }
        }
      });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const editButton = screen.getByLabelText(/Edit Resident/i);
        fireEvent.click(editButton);
      });

      expect(screen.getByText(/Edit Resident/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });
  });

  describe('Delete Resident', () => {
    test('should show delete confirmation dialog', async () => {
      const resident = {
        id: 'resident-1',
        firstName: 'John',
        lastName: 'Doe',
        status: 'active',
        facilityId: 'facility-123'
      };

      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            residents: [resident],
            pagination: { total: 1, page: 1, limit: 10, pages: 1 }
          }
        }
      });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/Delete Resident/i);
        fireEvent.click(deleteButton);
      });

      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    test('should only show delete button for admin', async () => {
      const nonAdminContext = {
        ...mockAuthContext,
        user: { ...mockUser, role: 'supervisor' }
      };

      const resident = {
        id: 'resident-1',
        firstName: 'John',
        lastName: 'Doe',
        status: 'active',
        facilityId: 'facility-123'
      };

      mockApi.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            residents: [resident],
            pagination: { total: 1, page: 1, limit: 10, pages: 1 }
          }
        }
      });

      render(
        <BrowserRouter>
          <AuthContext.Provider value={nonAdminContext as any}>
            <ToastContext.Provider value={mockToastContext as any}>
              <FacilityResidents />
            </ToastContext.Provider>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByLabelText(/Delete Resident/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    test('should handle empty optional fields', async () => {
      mockApi.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              residents: [],
              pagination: { total: 0, page: 1, limit: 10, pages: 0 }
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { physicians: [] }
          }
        });

      renderWithProviders(<FacilityResidents />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Resident/i);
        fireEvent.click(addButton);
      });

      // Fill only required fields
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          '/residents',
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            primaryPhysician: null,
            photoUrl: null,
            roomNumber: null
          })
        );
      });
    });
  });
});


