export interface RechargeRequest {
  id: string;
  userId: string;
  amount: number;
  screenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  adminNote?: string;
}

export interface UserWallet {
  userId: string;
  balance: number;
  lastUpdated: string;
}

class WalletService {
  private getRechargeRequests(): RechargeRequest[] {
    return JSON.parse(localStorage.getItem('rechargeRequests') || '[]');
  }

  private saveRechargeRequests(requests: RechargeRequest[]): void {
    localStorage.setItem('rechargeRequests', JSON.stringify(requests));
  }

  private getWallets(): UserWallet[] {
    return JSON.parse(localStorage.getItem('userWallets') || '[]');
  }

  private saveWallets(wallets: UserWallet[]): void {
    localStorage.setItem('userWallets', JSON.stringify(wallets));
  }

  async submitRechargeRequest(userId: string, amount: number, screenshot: string): Promise<RechargeRequest> {
    const requests = this.getRechargeRequests();
    const newRequest: RechargeRequest = {
      id: Date.now().toString(),
      userId,
      amount,
      screenshot,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    this.saveRechargeRequests(requests);
    return newRequest;
  }

  async getPendingRequests(): Promise<RechargeRequest[]> {
    return this.getRechargeRequests().filter(req => req.status === 'pending');
  }

  async getAllRequests(): Promise<RechargeRequest[]> {
    return this.getRechargeRequests();
  }

  async approveRecharge(requestId: string, adminNote?: string): Promise<void> {
    const requests = this.getRechargeRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) throw new Error('Request not found');
    
    request.status = 'approved';
    request.approvedAt = new Date().toISOString();
    request.adminNote = adminNote;
    
    this.saveRechargeRequests(requests);
    
    // Add amount to user wallet
    await this.addToWallet(request.userId, request.amount);
  }

  async rejectRecharge(requestId: string, adminNote?: string): Promise<void> {
    const requests = this.getRechargeRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) throw new Error('Request not found');
    
    request.status = 'rejected';
    request.adminNote = adminNote;
    
    this.saveRechargeRequests(requests);
  }

  async addToWallet(userId: string, amount: number): Promise<void> {
    const wallets = this.getWallets();
    const existingWallet = wallets.find(w => w.userId === userId);
    
    if (existingWallet) {
      existingWallet.balance += amount;
      existingWallet.lastUpdated = new Date().toISOString();
    } else {
      wallets.push({
        userId,
        balance: amount,
        lastUpdated: new Date().toISOString()
      });
    }
    
    this.saveWallets(wallets);
  }

  async deductFromWallet(userId: string, amount: number): Promise<boolean> {
    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.userId === userId);
    
    if (!wallet || wallet.balance < amount) {
      return false;
    }
    
    wallet.balance -= amount;
    wallet.lastUpdated = new Date().toISOString();
    this.saveWallets(wallets);
    return true;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.userId === userId);
    return wallet?.balance || 0;
  }
}

export const walletService = new WalletService();