import { createSlice } from '@reduxjs/toolkit';

const initialFormState = {
  complaint_source: '',
  customer_name: '',
  product_name: '',
  product_strength: '',
  batch_number: '',
  mfg_date: '',
  expiry_date: '',
  quantity_affected: '',
  complaint_type: '',
  complaint_date: '',
  description: '',
  initial_severity: 'Major',
  priority: 'Medium',
  triage_status: 'Pending Triage',
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState: {
    form: { ...initialFormState },
    aiPopulatedFields: {},
    savedComplaints: [],
    activeTab: 'form', // 'form' | 'registry'
    selectedComplaint: null,
  },
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    populateFormFromAi: (state, action) => {
      const extracted = action.payload;
      const populated = {};
      Object.keys(initialFormState).forEach((key) => {
        if (extracted[key] !== undefined && extracted[key] !== null) {
          state.form[key] = extracted[key];
          populated[key] = true;
        }
      });
      state.aiPopulatedFields = populated;
    },
    resetForm: (state) => {
      state.form = { ...initialFormState };
      state.aiPopulatedFields = {};
    },
    setSavedComplaints: (state, action) => {
      state.savedComplaints = action.payload;
    },
    addSavedComplaint: (state, action) => {
      state.savedComplaints.unshift(action.payload);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
  },
});

export const {
  updateFormField,
  populateFormFromAi,
  resetForm,
  setSavedComplaints,
  addSavedComplaint,
  setActiveTab,
  setSelectedComplaint,
} = complaintSlice.actions;

export default complaintSlice.reducer;
