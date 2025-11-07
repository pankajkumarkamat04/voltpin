const API_BASE_URL = 'https://api.voltpin.in/api/v1';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Helper function to make API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

// Authentication APIs
export const authAPI = {
  sendOTP: async (emailOrPhone: string, isPhone: boolean = false) => {
    const body = isPhone ? { phone: emailOrPhone } : { email: emailOrPhone };
    return apiCall('/user/send-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  verifyOTP: async (emailOrPhone: string, otp: string, isPhone: boolean = false) => {
    const body = isPhone 
      ? { phone: emailOrPhone, otp } 
      : { email: emailOrPhone, otp };
    return apiCall('/user/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  completeRegistration: async (data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => {
    return apiCall('/user/complete-registration', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUserInfo: async () => {
    return apiCall('/user/me', {
      method: 'GET',
    });
  },
};

// Game APIs
export const gameAPI = {
  getAllGames: async () => {
    return apiCall('/games/get-all', {
      method: 'GET',
    });
  },

  getDiamondPacks: async (gameId: string) => {
    return apiCall(`/games/${gameId}/diamond-packs`, {
      method: 'GET',
    });
  },

  validateUser: async (gameId: string, playerId: string, serverId: string) => {
    return apiCall('/games/validate-user', {
      method: 'POST',
      body: JSON.stringify({ gameId, playerId, serverId }),
    });
  },
};

// Order APIs
export const orderAPI = {
  createOrderWithWallet: async (data: {
    diamondPackId: string;
    playerId: string;
    server: string;
    quantity: number;
  }) => {
    return apiCall('/order/diamond-pack', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createOrderWithUPI: async (data: {
    diamondPackId: string;
    playerId: string;
    server: string;
    amount: number;
    quantity: number;
    redirectUrl: string;
  }) => {
    return apiCall('/order/diamond-pack-upi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOrderHistory: async (params: {
    page?: number;
    limit?: number;
    orderId?: string;
    dateFrom?: string;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.orderId) queryParams.append('orderId', params.orderId);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.status) queryParams.append('status', params.status);

    return apiCall(`/order/history?${queryParams.toString()}`, {
      method: 'GET',
    });
  },
};

// Transaction APIs
export const transactionAPI = {
  getTransactionHistory: async (params: {
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return apiCall(`/transaction/history?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  getTransactionStatus: async (clientTxnId: string, txnId?: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('client_txn_id', clientTxnId);
    if (txnId) queryParams.append('txn_id', txnId);

    return apiCall(`/transaction/status?${queryParams.toString()}`, {
      method: 'GET',
    });
  },
};

// Wallet APIs
export const walletAPI = {
  getDashboard: async () => {
    return apiCall('/user/dashboard', {
      method: 'GET',
    });
  },

  addCoins: async (amount: number) => {
    return apiCall('/wallet/add', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
};

// Other APIs
export const otherAPI = {
  getLeaderboard: async () => {
    return apiCall('/user/leaderboard', {
      method: 'GET',
    });
  },

  getNews: async (page: number = 1, limit: number = 20) => {
    return apiCall(`/news/list?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  }) => {
    return apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateProfilePicture: async (formData: FormData) => {
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/user/profile-picture`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  },
};

