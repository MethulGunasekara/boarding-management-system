const translations = {
  en: {
    // ── Auth ──────────────────────────────────────────────────────────
    bmsPortal: 'BMS Portal', boardingOwner: 'Boarding Owner', systemAdmin: 'System Admin',
    tenantPortal: 'Tenant Portal', signIn: 'Sign In', email: 'Email Address',
    password: 'Password', confirmPassword: 'Confirm Password', fullName: 'Full Name',
    phone: 'Phone Number', signInWithGoogle: 'Sign in with Google',
    orDivider: 'or', welcomeBack: 'Welcome back', signingIn: 'Signing in…',
    register: 'Create Account', registerOwner: 'Register as Owner',
    alreadyAccount: 'Already have an account?', noAccount: "Don't have an account?",
    tenantSignIn: 'Sign in to view your bills and manage your stay.',
    ownerBoardingOwner: 'Boarding Owner', ownerSystemAdmin: 'System Admin',

    // ── Nav / Sidebar ─────────────────────────────────────────────────
    dashboard: 'Dashboard', myProperties: 'My Properties', addProperty: 'Add Property',
    paymentApprovals: 'Payment Approvals', myBills: 'My Bills', logout: 'Logout',
    notifications: 'Notifications', markAllRead: 'Mark all read',
    noNotifications: 'No new notifications', newRegistration: 'New Owner Registration',
    viewOwner: 'View Owner Profile',

    // ── Common ────────────────────────────────────────────────────────
    loading: 'Loading…', back: 'Back', save: 'Save Changes', cancel: 'Cancel',
    edit: 'Edit', delete: 'Delete', search: 'Search', confirm: 'Confirm',
    success: 'Success!', error: 'Something went wrong.',
    total: 'total', active: 'Active', inactive: 'Inactive', overdue: 'Overdue',
    paid: 'Paid', pending: 'Pending', void: 'Void',
    yes: 'Yes', no: 'No', optional: 'optional',

    // ── Admin Dashboard ───────────────────────────────────────────────
    adminControlCenter: 'Admin Control Center',
    welcomeAdmin: 'Welcome back',
    totalProperties: 'Total Properties',
    overdueSubscriptions: 'Overdue Subscriptions',
    registeredProperties: 'Registered Properties',
    recentLogs: 'Recent System Logs',
    noLogs: 'No recent notifications.',
    noProperties: 'No properties registered yet.',

    // ── Admin Plans ───────────────────────────────────────────────────
    subscriptionPlans: 'Subscription Plans',
    subscriptionPlansDesc: 'Create and manage the plans boarding owners sign up for',
    newPlan: 'New Plan', editPlan: 'Edit Plan', createPlan: 'Create New Plan',
    planName: 'Plan Name', monthlyPrice: 'Monthly Price (Rs.)',
    maxBoardingPlaces: 'Max Boarding Places', maxRooms: 'Max Rooms per Boarding Place',
    featuresLabel: 'Features (shown on landing page)', addFeature: 'Add Feature',
    activeLabel: 'Active (visible to public)', deactivatePlan: 'Deactivate this plan?',
    noPlanYet: 'No plans yet. Create one above.',
    planSaved: 'Plan saved!', planCreated: 'Plan created!', planDeactivated: 'Plan deactivated',

    // ── Admin Owner Accounts ──────────────────────────────────────────
    ownerAccounts: 'Boarding Owner Accounts',
    ownerAccountsDesc: 'Manage subscriptions, plans, and payment status for all registered owners',
    totalOwners: 'Total Owners', onTime: 'On Time', paymentOverdue: 'Payment Overdue',
    owner: 'Owner', plan: 'Plan', status: 'Status', nextPayment: 'Next Payment',
    payment: 'Payment', noOwnersYet: 'No owners registered yet.',
    monthlyHistory: 'Monthly Subscription History', noPlanAssigned: 'No plan',
    changePlan: 'Change Plan', accountStatus: 'Account Status',
    activeStatus: 'Active', overdueStatus: 'Overdue', inactiveStatus: 'Inactive (Deactivated)',
    noSubRecords: 'No subscription records yet.',
    monthCol: 'Month', dueDateCol: 'Due Date', amountCol: 'Amount', paidOnCol: 'Paid On',
    actionCol: 'Action', markPaid: 'Mark Paid', prePaid: 'Pre-paid',
    planUpdated: 'Plan updated', statusUpdated: 'Status updated',

    // ── Properties ────────────────────────────────────────────────────
    properties: 'Properties', selectProperty: 'Select a Property',
    reviewPayments: 'Review Payments', addNewProperty: 'Add New Property',
    noPropertiesYet: "You haven't set up any properties yet.",
    registerFirstProperty: 'Register your first boarding place to get started.',
    propertyName: 'Property Name', address: 'Address', subscriptionStatus: 'Status',
    renewalDate: 'Renewal Date', manageArrow: 'Manage →',
    registerNewProperty: 'Register a New Boarding Place',
    registerNewPropertyDesc: 'All your rooms and tenants will be linked to this property.',
    namePlaceholder: "e.g., Kamala's Annex", addressPlaceholder: 'Full street address',
    totalCapacity: 'Total Capacity (Optional)', registerProperty: 'Register Property',

    // ── Property Detail ───────────────────────────────────────────────
    backToDashboard: 'Back to Dashboard',
    rooms: 'Rooms', addRoom: 'Add Room', roomNumber: 'Room Number',
    capacity: 'Capacity (Beds)', saveRoom: 'Save Room', noRoomsYet: 'No rooms added yet.',
    alerts: 'Alerts', overdueTenantsCount: 'Overdue Tenant(s)',
    allClear: 'All Clear', noTenantsOverdue: 'No tenants are currently overdue.',
    viewManageTenants: 'View & Manage All Tenants →', spotsAvailable: 'spots available',
    full: 'Full', cancelLabel: 'Cancel',

    // ── Tenant List ───────────────────────────────────────────────────
    currentTenants: 'Current Tenants', generateBills: 'Generate Monthly Bills',
    admitTenant: 'Admit New Tenant', tenantName: 'Name', roomCol: 'Room',
    statusCol: 'Status', viewProfile: 'View Profile', noTenantsFound: 'No tenants found.',
    searchPlaceholder: 'Search by name or room…',

    // ── Tenant Admission ──────────────────────────────────────────────
    admitNewTenant: 'Admit New Tenant',
    personalInfo: '1. Personal Information', emergencySection: '2. Emergency Contact',
    documentsSection: '3. Required Documents', financialsSection: '4. Room & Financials',
    allDocsRequired: 'All three documents are required before submission.',
    nicNumber: 'NIC Number', tempPassword: 'Temporary Password',
    tempPasswordHint: 'For tenant portal login',
    courseOrWorkplace: 'Course / Workplace', permanentAddress: 'Permanent Address',
    emergencyName: 'Contact Name', emergencyNumber: 'Contact Number',
    idFront: 'ID Front Image', idBack: 'ID Back Image', signature: 'Signature Image',
    clickToUpload: 'Click to upload', assignRoom: 'Assign Room',
    selectRoom: '-- Select a Room --', spotsLeft: 'spots left',
    monthlyRent: 'Monthly Rent Amount (Rs.)', keyMoney: 'Deposit Amount / Key Money (Rs.)',
    admitBtn: 'Admit Tenant & Record Deposit', uploading: 'Uploading & Saving…',
    validationRequired: 'Please upload all three required images.',

    // ── Tenant Profile ────────────────────────────────────────────────
    personalInfoTitle: 'Personal Info', tenancyTitle: 'Tenancy', emergencyTitle: 'Emergency Contact',
    nicLabel: 'NIC', emailLabel: 'Email', contactLabel: 'Contact',
    addressLabel: 'Address', courseLabel: 'Course', rentLabel: 'Monthly Rent',
    roomLabel: 'Room', admittedLabel: 'Admitted', nameLabel: 'Name', numberLabel: 'Number',
    outstandingBalance: 'Total Outstanding', recordPayment: 'Record Payment',
    chargeHistory: 'Shared Bill Charges', noCharges: 'No shared-bill charges recorded yet.',
    dateDue: 'Date Due', description: 'Description', amountLabel: 'Amount', payThis: 'Pay This',
    documents: 'Documents', actionsTitle: 'Actions', moveOut: 'Move Out Tenant',
    moveOutConfirm: 'Are you sure? This will void all pending charges.',
    movedOut: 'Moved Out', tenantNotFound: 'Tenant not found.',
    editTenant: 'Edit Tenant', editTenantTitle: 'Edit Tenant Profile',
    saveChanges: 'Save Changes', updateSuccess: 'Tenant profile updated.',

    // ── Rent Records ──────────────────────────────────────────────────
    rentRecords: 'Monthly Rent Records', preRecordBtn: 'Pre-record Payment',
    paymentDueDate: 'Payment Due Date', autoFilled: 'Auto-filled from date',
    noRentRecords: 'No rent records yet. Records are auto-generated monthly, or you can pre-record one above.',
    monthName: 'Month', paidOn: 'Paid On', markRentPaid: 'Mark Paid', prePaidBadge: 'Pre-paid',

    // ── Cost / Bills ──────────────────────────────────────────────────
    generateBillsTitle: 'Generate Monthly Bills',
    generateBillsDesc: 'Create a shared bill and distribute it among tenants',
    newBill: '1. Create New Bill', reviewGenerate: '2. Review & Generate',
    billTitle: 'Bill Title', billTitlePlaceholder: 'e.g., Electricity - September',
    totalAmount: 'Total Amount (Rs.)', splitMethod: 'Split Method',
    even: 'Even (Divide equally)', custom: 'Custom (By Percentage %)', manual: 'Manual (Exact Rs. Amounts)',
    evenHint: 'Cost divided equally among all tenants',
    customHint: 'You set the percentage for each tenant',
    manualHint: 'You enter the exact Rs. amount for each',
    setupSplit: 'Setup Split →', processing: 'Processing…',
    setupFirst: 'Setup the bill on the left first.',
    modeLabel: 'Mode:', assigned: 'assigned', over: 'over', remaining: 'remaining',
    percentageCol: 'Percentage (%)', rsValue: 'Rs. Value',
    confirmGenerate: 'Confirm & Generate Bills ✓', generating: 'Generating…',

    // ── Payments ──────────────────────────────────────────────────────
    pendingPayments: 'Pending Payments',
    pendingPaymentsDesc: 'Review bank transfer receipts submitted by tenants',
    allCaughtUp: 'All caught up!', noReviewPending: 'No tenants have submitted payments for review.',
    tenantCol: 'Tenant', billDetails: 'Bill Details', receipt: 'Receipt',
    viewReceipt: 'View Receipt', approve: 'Approve', reject: 'Reject',
    paymentMethod: 'Payment Method', cash: 'Cash', bankTransfer: 'Bank Transfer',
    amountPaid: 'Amount Paid (Rs.)', paymentApproved: 'Payment approved!',
    paymentRejected: 'Payment rejected!',

    // ── Tenant Dashboard ──────────────────────────────────────────────
    welcomeTenant: 'Welcome', outstandingBalance2: 'Outstanding Balance',
    allCaughtUpMsg: 'You are all caught up!',
    unpaidBillsMsg: 'You have unpaid bills. Please check your charge history.',
    myBillsTitle: 'My Bills', noBillsYet: 'No bills recorded yet.',
    dateCol: 'Date', monthlyRentLabel: 'Monthly Rent', sharedBill: 'Shared Bill',
    payNow: 'Pay Now', underReview: 'Under Review',
    submitPayment: 'Submit Payment', uploadReceipt: 'Upload Bank Transfer Receipt',
    submitting: 'Uploading…', submitBtn: 'Submit',
    changePassword: 'Change Password', currentPassword: 'Current Password',
    newPassword: 'New Password', confirmNewPassword: 'Confirm New Password',
    passwordChanged: 'Password updated successfully!', passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 6 characters.',
    updatePassword: 'Update Password', updating: 'Updating…',

    // ── Signup ────────────────────────────────────────────────────────
    choosePlan: '1. Choose Your Plan', accountDetails: '2. Your Account Details',
    plansLoading: 'Loading plans…', perMonth: '/mo', property: 'property', roomsEach: 'rooms each',
    signupNote: "You're signing up for", signupNoteEnd: 'Your first payment will be due in 30 days.',
    createAccount: 'Create My Account →', creatingAccount: 'Creating Account…',
    termsNote: 'By signing up, you agree to our terms of service.',

    // ── Language / Theme ──────────────────────────────────────────────
    language: 'Language', darkMode: 'Dark Mode', lightMode: 'Light Mode',
  },

  si: {
    // ── Auth ──────────────────────────────────────────────────────────
    bmsPortal: 'BMS පද්ධතිය', boardingOwner: 'නවාතැන් හිමිකරු', systemAdmin: 'පද්ධති පරිපාලක',
    tenantPortal: 'කුලී නිවැසි පද්ධතිය', signIn: 'පිවිසෙන්න', email: 'විද්‍යුත් තැපෑල',
    password: 'මුරපදය', confirmPassword: 'මුරපදය තහවුරු කරන්න', fullName: 'සම්පූර්ණ නම',
    phone: 'දුරකථන අංකය', signInWithGoogle: 'Google මගින් පිවිසෙන්න',
    orDivider: 'හෝ', welcomeBack: 'නැවත සාදරයෙන් පිළිගනිමු', signingIn: 'පිවිසෙමින්…',
    register: 'ගිණුම සාදන්න', registerOwner: 'හිමිකරු ලෙස ලියාපදිංචි වන්න',
    alreadyAccount: 'දැනටමත් ගිණුමක් තිබේද?', noAccount: 'ගිණුමක් නැද්ද?',
    tenantSignIn: 'ඔබේ බිල්පත් බලා ගැනීමට පිවිසෙන්න.',
    ownerBoardingOwner: 'නවාතැන් හිමිකරු', ownerSystemAdmin: 'පද්ධති පරිපාලක',

    // ── Nav / Sidebar ─────────────────────────────────────────────────
    dashboard: 'ඩෑෂ්බෝඩ්', myProperties: 'මගේ ස්ථාන', addProperty: 'ස්ථානය එකතු කරන්න',
    paymentApprovals: 'ගෙවීම් අනුමැතිය', myBills: 'මගේ බිල්පත්', logout: 'පිටවෙන්න',
    notifications: 'දැනුම්දීම්', markAllRead: 'සියල්ල කියවූ ලෙස සලකන්න',
    noNotifications: 'නව දැනුම්දීම් නොමැත', newRegistration: 'නව හිමිකරු ලියාපදිංචිය',
    viewOwner: 'හිමිකරු පැතිකඩ බලන්න',

    // ── Common ────────────────────────────────────────────────────────
    loading: 'පූරණය වෙමින්…', back: 'ආපසු', save: 'වෙනස්කම් සුරකින්න', cancel: 'අවලංගු',
    edit: 'සංස්කරණය', delete: 'මකන්න', search: 'සොයන්න', confirm: 'තහවුරු කරන්න',
    success: 'සාර්ථකයි!', error: 'දෝෂයක් සිදු විය.',
    total: 'මුළු', active: 'ක්‍රියාකාරී', inactive: 'අක්‍රිය', overdue: 'කල් ඉකුත්',
    paid: 'ගෙවා ඇත', pending: 'හිඟ', void: 'අහෝසි',
    yes: 'ඔව්', no: 'නැත', optional: 'විකල්ප',

    // ── Admin Dashboard ───────────────────────────────────────────────
    adminControlCenter: 'පරිපාලක මධ්‍යස්ථානය',
    welcomeAdmin: 'නැවත සාදරයෙන් පිළිගනිමු',
    totalProperties: 'මුළු ස්ථාන',
    overdueSubscriptions: 'කල් ඉකුත් දායකත්ව',
    registeredProperties: 'ලියාපදිංචි ස්ථාන',
    recentLogs: 'මෑත පද්ධති ලොග්',
    noLogs: 'මෑතකාලීන දැනුම්දීම් නොමැත.',
    noProperties: 'ස්ථාන ලියාපදිංචි නොවේ.',

    // ── Admin Plans ───────────────────────────────────────────────────
    subscriptionPlans: 'දායකත්ව සැලසුම්',
    subscriptionPlansDesc: 'නවාතැන් හිමිකරුවන් ලියාපදිංචි වන සැලසුම් සාදන්න',
    newPlan: 'නව සැලසුම', editPlan: 'සැලසුම සංස්කරණය', createPlan: 'නව සැලසුම සාදන්න',
    planName: 'සැලසුමේ නම', monthlyPrice: 'මාසික මිල (රු.)',
    maxBoardingPlaces: 'උපරිම නවාතැන් ස්ථාන', maxRooms: 'ස්ථානයකට උපරිම කාමර',
    featuresLabel: 'විශේෂාංග (ගොනු පිටුවේ පෙන්වයි)', addFeature: 'විශේෂාංගයක් එකතු කරන්න',
    activeLabel: 'ක්‍රියාකාරී (ජනතාවට දෘශ්‍ය)', deactivatePlan: 'සැලසුම අක්‍රිය කරන්නද?',
    noPlanYet: 'සැලසුම් නොමැත. ඉහත සාදන්න.',
    planSaved: 'සැලසුම සුරකිනු ලැබීය!', planCreated: 'සැලසුම සාදනු ලැබීය!',

    // ── Admin Owner Accounts ──────────────────────────────────────────
    ownerAccounts: 'නවාතැන් හිමිකරු ගිණුම්',
    ownerAccountsDesc: 'සියලු ලියාපදිංචි හිමිකරුවන්ගේ දායකත්ව, සැලසුම් සහ ගෙවීම් තත්ත්වය',
    totalOwners: 'මුළු හිමිකරුවන්', onTime: 'නිවැරදිව', paymentOverdue: 'ගෙවීම් කල් ඉකුත්',
    owner: 'හිමිකරු', plan: 'සැලසුම', status: 'තත්ත්වය', nextPayment: 'ඊළඟ ගෙවීම',
    payment: 'ගෙවීම', noOwnersYet: 'හිමිකරුවන් ලියාපදිංචි නොවේ.',
    monthlyHistory: 'මාසික දායකත්ව ඉතිහාසය', noPlanAssigned: 'සැලසුමක් නැත',
    changePlan: 'සැලසුම වෙනස් කරන්න', accountStatus: 'ගිණුම් තත්ත්වය',
    activeStatus: 'ක්‍රියාකාරී', overdueStatus: 'කල් ඉකුත්', inactiveStatus: 'අක්‍රිය',
    noSubRecords: 'දායකත්ව වාර්තා නොමැත.',
    monthCol: 'මාසය', dueDateCol: 'නියම දිනය', amountCol: 'මුදල', paidOnCol: 'ගෙවූ දිනය',
    actionCol: 'ක්‍රියාව', markPaid: 'ගෙවූ ලෙස සලකන්න', prePaid: 'කල්‍ อ้างදීම',

    // ── Properties ────────────────────────────────────────────────────
    properties: 'ස්ථාන', selectProperty: 'ස්ථානයක් තෝරන්න',
    reviewPayments: 'ගෙවීම් සමාලෝචනය', addNewProperty: 'නව ස්ථානය එකතු කරන්න',
    noPropertiesYet: 'ඔබ තවම ස්ථාන සකස් කර නොමැත.',
    registerFirstProperty: 'ආරම්භ කිරීමට ඔබේ පළමු නවාතැන ලියාපදිංචි කරන්න.',
    propertyName: 'ස්ථානයේ නම', address: 'ලිපිනය', subscriptionStatus: 'දායකත්ව තත්ත්වය',
    renewalDate: 'අළුත් කරන දිනය', manageArrow: 'කළමනාකරණය →',
    registerNewProperty: 'නව නවාතැන් ස්ථානයක් ලියාපදිංචි කරන්න',
    registerNewPropertyDesc: 'ඔබේ සියලු කාමර සහ කුලී නිවැසියන් මෙම ස්ථානයට සම්බන්ධ වනු ඇත.',
    namePlaceholder: 'උදා: කමලා\'ස් ඇනෙක්ස්', addressPlaceholder: 'සම්පූර්ණ ලිපිනය',
    totalCapacity: 'මුළු ධාරිතාව (විකල්ප)', registerProperty: 'ස්ථානය ලියාපදිංචි කරන්න',

    // ── Property Detail ───────────────────────────────────────────────
    backToDashboard: 'ඩෑෂ්බෝඩ් වෙත ආපසු',
    rooms: 'කාමර', addRoom: 'කාමරය එකතු කරන්න', roomNumber: 'කාමර අංකය',
    capacity: 'ධාරිතාව (ඇඳන්)', saveRoom: 'කාමරය සුරකින්න', noRoomsYet: 'කාමර එකතු නොකළ.',
    alerts: 'අනතුරු ඇඟවීම්', overdueTenantsCount: 'කල් ඉකුත් කුලී නිවැසියෝ',
    allClear: 'සියල්ල හොඳින්', noTenantsOverdue: 'දැනට කිසිදු කුලී නිවැසියෙකු කල් ඉකුත් නොවේ.',
    viewManageTenants: 'සියලු කුලී නිවැසියන් බලන්න →', spotsAvailable: 'ඉඩ ඇත',
    full: 'පිරී ඇත', cancelLabel: 'අවලංගු',

    // ── Tenant List ───────────────────────────────────────────────────
    currentTenants: 'වත්මන් කුලී නිවැසියන්', generateBills: 'මාසික බිල්පත් ජනනය',
    admitTenant: 'නව කුලී නිවැසියෙකු ඇතුළත් කරන්න', tenantName: 'නම', roomCol: 'කාමරය',
    statusCol: 'තත්ත්වය', viewProfile: 'පැතිකඩ බලන්න', noTenantsFound: 'කුලී නිවැසියන් නොමැත.',
    searchPlaceholder: 'නම හෝ කාමරය අනුව සොයන්න…',

    // ── Tenant Admission ──────────────────────────────────────────────
    admitNewTenant: 'නව කුලී නිවැසියෙකු ඇතුළත් කරන්න',
    personalInfo: '1. පෞද්ගලික තොරතුරු', emergencySection: '2. හදිසි සම්බන්ධතාව',
    documentsSection: '3. අවශ්‍ය ලේඛන', financialsSection: '4. කාමරය සහ මූල්‍ය',
    allDocsRequired: 'ඉදිරිපත් කිරීමට පෙර ලේඛන 3ම අවශ්‍ය.',
    nicNumber: 'ජා.හැ.අ. අංකය', tempPassword: 'තාවකාලික මුරපදය',
    tempPasswordHint: 'කුලී නිවැසි පද්ධතියේ ලොගින් සඳහා',
    courseOrWorkplace: 'පාඨමාලාව / රැකියා ස්ථානය', permanentAddress: 'ස්ථිර ලිපිනය',
    emergencyName: 'සම්බන්ධතා නම', emergencyNumber: 'සම්බන්ධතා අංකය',
    idFront: 'ජා.හැ.අ. ඉදිරිපස', idBack: 'ජා.හැ.අ. පසුපස', signature: 'අත්සන් රූපය',
    clickToUpload: 'උඩුගත කිරීමට ක්ලික් කරන්න', assignRoom: 'කාමරය ලබා දෙන්න',
    selectRoom: '-- කාමරයක් තෝරන්න --', spotsLeft: 'ඉඩ ශේෂ',
    monthlyRent: 'මාසික කුලිය (රු.)', keyMoney: 'තැන්පතු / යතුරු මුදල (රු.)',
    admitBtn: 'කුලී නිවැසියා ඇතුළත් කරන්න', uploading: 'උඩුගත කරමින්…',
    validationRequired: 'ලේඛන 3ම උඩුගත කරන්න.',

    // ── Tenant Profile ────────────────────────────────────────────────
    personalInfoTitle: 'පෞද්ගලික තොරතුරු', tenancyTitle: 'නවාතැන් විස්තර', emergencyTitle: 'හදිසි සම්බන්ධතාව',
    nicLabel: 'ජා.හැ.අ.', emailLabel: 'විද්‍යුත් තැපෑල', contactLabel: 'දුරකථනය',
    addressLabel: 'ලිපිනය', courseLabel: 'පාඨමාලාව', rentLabel: 'කුලිය',
    roomLabel: 'කාමරය', admittedLabel: 'ඇතුළත් කළ', nameLabel: 'නම', numberLabel: 'අංකය',
    outstandingBalance: 'මුළු හිඟ මුදල', recordPayment: 'ගෙවීම සටහන් කරන්න',
    chargeHistory: 'බෙදාගත් බිල් ගාස්තු', noCharges: 'බෙදාගත් ගාස්තු නොමැත.',
    dateDue: 'නියම දිනය', description: 'විස්තරය', amountLabel: 'මුදල', payThis: 'ගෙවන්න',
    documents: 'ලේඛන', actionsTitle: 'ක්‍රියා', moveOut: 'ගෙය හැර යාම සටහන් කරන්න',
    moveOutConfirm: 'ඔබ විශ්වාසද? හිඟ ගාස්තු සියල්ල අහෝසි වේ.',
    movedOut: 'ගෙය හැර ගොස් ඇත', tenantNotFound: 'කුලී නිවැසියා හමු නොවීය.',
    editTenant: 'කුලී නිවැසියා සංස්කරණය', editTenantTitle: 'කුලී නිවැසියාගේ පැතිකඩ සංස්කරණය',
    saveChanges: 'වෙනස්කම් සුරකින්න', updateSuccess: 'පැතිකඩ යාවත්කාලීන කළා.',

    // ── Rent Records ──────────────────────────────────────────────────
    rentRecords: 'මාසික කුලී වාර්තා', preRecordBtn: 'ගෙවීම කල්‍ සටහන් කරන්න',
    paymentDueDate: 'ගෙවිය යුතු දිනය', autoFilled: 'දිනයෙන් ස්වයංක්‍රීයව',
    noRentRecords: 'කුලී වාර්තා නොමැත. මාසිකව ස්වයංක්‍රීයව ජනනය වේ.',
    monthName: 'මාසය', paidOn: 'ගෙවූ දිනය', markRentPaid: 'ගෙවූ ලෙස සලකන්න', prePaidBadge: 'කල්‍ ගෙවීම',

    // ── Cost / Bills ──────────────────────────────────────────────────
    generateBillsTitle: 'මාසික බිල්පත් ජනනය', generateBillsDesc: 'බෙදාගත් බිල්පතක් සාදා කුලී නිවැසියන් අතර බෙදා හරින්න',
    newBill: '1. නව බිල්පත සාදන්න', reviewGenerate: '2. සමාලෝචනය කර ජනනය කරන්න',
    billTitle: 'බිල්පතේ නම', billTitlePlaceholder: 'උදා: විදුලිය - සැප්තැම්බර්',
    totalAmount: 'මුළු මුදල (රු.)', splitMethod: 'බෙදීමේ ක්‍රමය',
    even: 'සම සේ (සමාන ලෙස)', custom: 'අභිරුචි (ප්‍රතිශතය %)', manual: 'අතින් (නිශ්චිත රු.)',
    evenHint: 'සියලු කුලී නිවැසියන් අතර සමානව', customHint: 'ඔබ ප්‍රතිශතය ලබා දෙයි', manualHint: 'ඔබ නිශ්චිත රු. ලබා දෙයි',
    setupSplit: 'බෙදීම සකස් කරන්න →', processing: 'සකසමින්…',
    setupFirst: 'පළමු වම් පස සැකසුම කරන්න.',
    modeLabel: 'ක්‍රමය:', assigned: 'ලබා දී ඇත', over: 'ඉදිරි', remaining: 'ශේෂ',
    percentageCol: 'ප්‍රතිශතය (%)', rsValue: 'රු. අගය',
    confirmGenerate: 'තහවුරු කර බිල්පත් ජනනය කරන්න ✓', generating: 'ජනනය කරමින්…',

    // ── Payments ──────────────────────────────────────────────────────
    pendingPayments: 'හිඟ ගෙවීම්', pendingPaymentsDesc: 'කුලී නිවැසියන් ඉදිරිපත් කළ රිසිට්පත් සමාලෝchanaය',
    allCaughtUp: 'සියල්ල හොඳින්!', noReviewPending: 'සමාලෝchanaය සඳහා ගෙවීම් නොමැත.',
    tenantCol: 'කුලී නිවැසියා', billDetails: 'බිල් විස්තර', receipt: 'රිසිට්පත',
    viewReceipt: 'රිසිට්පත බලන්න', approve: 'අනුමත කරන්න', reject: 'ප්‍රතික්ෂේප කරන්න',
    paymentMethod: 'ගෙවීමේ ක්‍රමය', cash: 'මුදල්', bankTransfer: 'බැංකු හුවමාරුව',
    amountPaid: 'ගෙවූ මුදල (රු.)',

    // ── Tenant Dashboard ──────────────────────────────────────────────
    welcomeTenant: 'සාදරයෙන් පිළිගනිමු',
    outstandingBalance2: 'හිඟ ශේෂය',
    allCaughtUpMsg: 'ඔබ සියල්ල ගෙවා ඇත!',
    unpaidBillsMsg: 'ගෙවිය නොහැකි බිල්පත් ඇත. ඔබේ ගාස්තු ඉතිහාසය පරීක්ෂා කරන්න.',
    myBillsTitle: 'මගේ බිල්පත්', noBillsYet: 'බිල්පත් සටහන් නොකළ.',
    dateCol: 'දිනය', monthlyRentLabel: 'මාසික කුලිය', sharedBill: 'බෙදාගත් බිල්',
    payNow: 'දැන් ගෙවන්න', underReview: 'සමාලෝchanaයේ',
    submitPayment: 'ගෙවීම ඉදිරිපත් කරන්න', uploadReceipt: 'බැංකු හුවමාරු රිසිට්පත උඩුගත කරන්න',
    submitting: 'උඩුගත කරමින්…', submitBtn: 'ඉදිරිපත් කරන්න',
    changePassword: 'මුරපදය වෙනස් කරන්න', currentPassword: 'වත්මන් මුරපදය',
    newPassword: 'නව මුරපදය', confirmNewPassword: 'නව මුරපදය තහවුරු කරන්න',
    passwordChanged: 'මුරපදය සාර්ථකව යාවත්කාලීන කළා!', passwordMismatch: 'මුරපද නොගැලපේ.',
    passwordTooShort: 'මුරපදය අවම අකුරු 6ක් විය යුතුය.',
    updatePassword: 'මුරපදය යාවත්කාලීන කරන්න', updating: 'යාවත්කාලීන කරමින්…',

    // ── Signup ────────────────────────────────────────────────────────
    choosePlan: '1. ඔබේ සැලසුම තෝරන්න', accountDetails: '2. ඔබේ ගිණුම් විස්තර',
    plansLoading: 'සැලසුම් පූරණය කරමින්…', perMonth: '/මාස', property: 'ස්ථානය', roomsEach: 'කාමර',
    signupNote: 'ඔබ ලියාපදිංචි වෙමින් සිටින්නේ', signupNoteEnd: 'ඔබේ පළමු ගෙවීම දින 30 කින්.',
    createAccount: 'මගේ ගිණුම සාදන්න →', creatingAccount: 'ගිණුම සාදමින්…',

    // ── Language / Theme ──────────────────────────────────────────────
    language: 'භාෂාව', darkMode: 'අඳුරු මාදිලිය', lightMode: 'ආලෝකවත් මාදිලිය',
  },
};

export default translations;