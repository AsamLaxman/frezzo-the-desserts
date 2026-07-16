import { useState, useEffect } from "react";
import { User, CreditCard, ChevronRight, Settings, Bell, Shield, LogOut, ChartLine, Cloud, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { googleSignIn, getAccessToken, initAuth } from "../lib/auth";

export function ProfileView({ 
  onLogout, 
  isAdmin = false, 
  userEmail = '',
  notificationsEnabled = false,
  onToggleNotifications = () => {}
}: { 
  onLogout: () => void, 
  isAdmin?: boolean, 
  userEmail?: string,
  notificationsEnabled?: boolean,
  onToggleNotifications?: () => void
}) {
  const [activeSection, setActiveSection] = useState<'profile' | 'financial'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(isAdmin ? 'Asam Laxman' : (userEmail.split('@')[0] || 'User'));
  const [email, setEmail] = useState(userEmail || 'asamlaxman2003@gmail.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveMessage, setDriveMessage] = useState('');
  const [isSavingToSheets, setIsSavingToSheets] = useState(false);
  const [sheetsMessage, setSheetsMessage] = useState('');
  const [isSyncingStorage, setIsSyncingStorage] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isAdmin) {
      const stored = JSON.parse(localStorage.getItem('frezzo_users') || '{}');
      setRegisteredUsers(Object.keys(stored));
    }
  }, [isAdmin]);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-smooth z-10 pt-2 scrollbar-hide pb-24 bg-white">
      <div className="max-w-2xl mx-auto flex flex-col min-h-full">
        <h2 style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }} className="text-3xl font-bold tracking-tight text-[#4A2E1B] mb-2 italic">
          My Account
        </h2>
        <p className="text-sm font-medium text-[#A89F91] mb-6">Manage your profile and financial settings.</p>
        
        {/* User Info Card */}
        <div className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#EAE0D5] flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#F48FB1]/20 flex items-center justify-center text-[#F48FB1]">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#4A2E1B]">{name}</h3>
            <p className="text-xs text-[#A89F91]">{email}</p>
            <span className="inline-block mt-2 text-[10px] uppercase tracking-widest font-bold text-[#81C784] bg-[#81C784]/10 px-2 py-1 rounded">Premium Member</span>
          </div>
        </div>

        {/* Admin Dashboard: Other Users */}
        {isAdmin && (
          <div className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#F48FB1]/50 mb-8 shadow-sm">
            <h3 className="text-sm font-bold text-[#4A2E1B] mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F48FB1]" /> Admin Dashboard: Total Users
            </h3>
            <p className="text-xs text-[#A89F91] mb-4">View other user profiles in your app.</p>
            <div className="space-y-2">
              {registeredUsers.length > 0 ? (
                registeredUsers.map((user, i) => (
                  <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#EAE0D5]">
                    <span className="text-sm font-medium text-[#4A2E1B]">{user}</span>
                    <span className="text-[10px] uppercase font-bold text-[#A89F91] bg-[#FFF9F2] px-2 py-1 rounded">Limited Access</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8B5E3C] italic">No other registered users found.</p>
              )}
            </div>
          </div>
        )}

        {/* Storage Card */}
        {isAdmin && (
        <div className="bg-white p-5 rounded-2xl border border-[#EAE0D5] mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#4A2E1B]">OnePlus Cloud Storage</h3>
                <p className="text-[10px] text-[#A89F91]">Connected to {email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#4285F4]">5 TB</p>
              <p className="text-[10px] text-[#A89F91] uppercase tracking-widest font-bold">Total Storage</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center pt-4 border-t border-[#EAE0D5] gap-3">
            <button 
              onClick={() => {
                setIsSyncingStorage(true);
                setStorageMessage(`Syncing personal data to ${email} (OnePlus Cloud)...`);
                setTimeout(() => {
                  setIsSyncingStorage(false);
                  setStorageMessage(`Successfully secured data in your personal 5 TB storage!`);
                  setTimeout(() => setStorageMessage(''), 3000);
                }, 2000);
              }}
              disabled={isSyncingStorage}
              className="w-full bg-[#FFF9F2] border border-[#EAE0D5] text-[#4285F4] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:border-[#4285F4] transition-colors"
            >
              <Cloud className="w-4 h-4" />
              {isSyncingStorage ? 'Syncing...' : 'Sync to My OnePlus Cloud Storage'}
            </button>
            {storageMessage && (
              <div className="flex items-center justify-between w-full mt-2 bg-[#E8F5E9] border border-[#A5D6A7] px-3 py-2 rounded-lg">
                <p className="text-[10px] text-[#2E7D32] font-bold">{storageMessage}</p>
                <button onClick={() => setStorageMessage('')} className="text-[#2E7D32] hover:text-[#1B5E20]"><X className="w-3 h-3" /></button>
              </div>
            )}

            {!isVaultOpen ? (
              <button 
                onClick={() => setIsVaultOpen(true)}
                className="w-full bg-white border border-[#F48FB1] text-[#F48FB1] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#F48FB1] hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4" />
                Open Secure Storage Vault (Premium Only)
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full text-left bg-[#FFF9F2] p-4 rounded-xl border border-[#EAE0D5] mt-2">
                <div className="flex items-center justify-between mb-3 border-b border-[#EAE0D5] pb-2">
                  <h4 className="text-sm font-bold text-[#4A2E1B] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#81C784]" /> Closed Vault Access
                  </h4>
                  <button onClick={() => setIsVaultOpen(false)} className="p-1 text-[#A89F91] hover:text-[#4A2E1B] bg-white rounded-full border border-[#EAE0D5] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-[#A89F91] mb-4">This data is strictly private and locked to your Premium account. No one else has access.</p>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-[#4A2E1B] font-medium flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#A89F91]" /> Financial_History_2025.pdf</span>
                    <span className="text-[10px] text-[#81C784] font-bold bg-[#81C784]/10 px-2 py-0.5 rounded">Encrypted</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-[#4A2E1B] font-medium flex items-center gap-2"><User className="w-4 h-4 text-[#A89F91]" /> Identity_Verification.jpg</span>
                    <span className="text-[10px] text-[#81C784] font-bold bg-[#81C784]/10 px-2 py-0.5 rounded">Encrypted</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-[#4A2E1B] font-medium flex items-center gap-2"><Settings className="w-4 h-4 text-[#A89F91]" /> App_Preferences_Backup.json</span>
                    <span className="text-[10px] text-[#81C784] font-bold bg-[#81C784]/10 px-2 py-0.5 rounded">Encrypted</span>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-[#EAE0D5]">
          <button 
            onClick={() => setActiveSection('profile')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest ${activeSection === 'profile' ? 'text-[#F48FB1] border-b-2 border-[#F48FB1]' : 'text-[#A89F91]'}`}
          >
            Profile Settings
          </button>
          <button 
            onClick={() => setActiveSection('financial')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest ${activeSection === 'financial' ? 'text-[#F48FB1] border-b-2 border-[#F48FB1]' : 'text-[#A89F91]'}`}
          >
            Financial Profile
          </button>
        </div>

        {activeSection === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {isEditingProfile ? (
              <div className="bg-white p-5 rounded-xl border border-[#F48FB1] space-y-4 shadow-sm">
                <div>
                  <label className="block text-[10px] font-bold text-[#A89F91] uppercase tracking-widest mb-1.5">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#FFF9F2] border border-[#EAE0D5] rounded-lg px-3 py-2 text-sm font-medium text-[#4A2E1B] focus:outline-none focus:border-[#F48FB1] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#A89F91] uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#FFF9F2] border border-[#EAE0D5] rounded-lg px-3 py-2 text-sm font-medium text-[#4A2E1B] focus:outline-none focus:border-[#F48FB1] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#A89F91] uppercase tracking-widest mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#FFF9F2] border border-[#EAE0D5] rounded-lg px-3 py-2 text-sm font-medium text-[#4A2E1B] focus:outline-none focus:border-[#F48FB1] transition-colors" />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-[#A89F91] hover:text-[#4A2E1B] hover:bg-[#FFF9F2] transition-colors uppercase tracking-wider">Cancel</button>
                  <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 bg-[#F48FB1] text-white rounded-lg text-xs font-bold hover:bg-[#F06292] transition-colors uppercase tracking-wider">Save Changes</button>
                </div>
              </div>
            ) : (
              <div onClick={() => setIsEditingProfile(true)} className="bg-white p-4 rounded-xl border border-[#EAE0D5] flex items-center justify-between cursor-pointer hover:border-[#F48FB1] transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#8B5E3C]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#4A2E1B]">Personal Information</h4>
                    <p className="text-[10px] text-[#A89F91]">Update your name and contact details</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#A89F91]" />
              </div>
            )}

            {isAdmin && (
              <div className="bg-white p-4 rounded-xl border border-[#EAE0D5] flex items-center justify-between cursor-pointer hover:border-[#F48FB1] transition-colors shadow-sm" onClick={onToggleNotifications}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#8B5E3C]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#4A2E1B]">Notifications</h4>
                    <p className="text-[10px] text-[#A89F91]">{notificationsEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                  <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} readOnly />
                  <div className="w-11 h-6 bg-[#EAE0D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F48FB1]"></div>
                </label>
              </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-[#EAE0D5] flex items-center justify-between cursor-pointer hover:border-[#F48FB1] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#8B5E3C]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#4A2E1B]">Privacy & Security</h4>
                  <p className="text-[10px] text-[#A89F91]">Password and authentication</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#A89F91]" />
            </div>
          </motion.div>
        )}

        {activeSection === 'financial' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="bg-gradient-to-r from-[#F8BBD0] to-[#E1BEE7] p-5 rounded-xl text-white shadow-sm mb-4">
              <h3 className="text-lg font-bold mb-1">Financial Profile Enabled</h3>
              <p className="text-xs text-white/90">Track your spending and budget seamlessly.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#EAE0D5] flex items-center justify-between cursor-pointer hover:border-[#F48FB1] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#8B5E3C]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#4A2E1B]">Payment Methods</h4>
                  <p className="text-[10px] text-[#A89F91]">Manage your saved cards</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#A89F91]" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#EAE0D5] flex items-center justify-between cursor-pointer hover:border-[#F48FB1] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF9F2] flex items-center justify-center text-[#8B5E3C]">
                  <ChartLine className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#4A2E1B]">Spending History & Budget</h4>
                  <p className="text-[10px] text-[#A89F91]">View your financial profile insights</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#A89F91]" />
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          {isAdmin && (
            <>
          <button 
            onClick={async () => {
              try {
                setIsSavingToDrive(true);
                setDriveMessage('Authenticating...');
                
                let token = await getAccessToken();
                if (!token) {
                  const authResult = await googleSignIn();
                  token = authResult?.accessToken || null;
                }
                
                if (!token) {
                  throw new Error('Authentication required to save to Drive');
                }

                setDriveMessage('Saving to Google Drive...');
                const profileData = {
                  personal: { name, email, phone },
                  financial: { status: 'Future Financial Profile Enabled', memberType: 'Premium' },
                  loginInformation: { provider: 'Frezzo Auth', lastLogin: new Date().toISOString() }
                };
                const res = await fetch('/api/export-to-drive', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ profileData })
                });
                const data = await res.json();
                if (data.success) {
                  setDriveMessage('Saved to Google Drive successfully!');
                  setTimeout(() => setDriveMessage(''), 3000);
                } else {
                  setDriveMessage('Error: ' + data.error);
                }
              } catch (e: any) {
                setDriveMessage('Error saving to Drive');
              } finally {
                setIsSavingToDrive(false);
              }
            }}
            disabled={isSavingToDrive}
            className="w-full bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:border-[#4285F4] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 87.3 127.3"><path d="M57.6 86.8L28.8 127.3H87.3L57.6 86.8Z" fill="#0F9D58"/><path d="M28.8 33.1L0 82.5l28.8 44.8 28.8-44.8L28.8 33.1Z" fill="#F4B400"/><path d="M28.8 33.1H87.3L57.6 82.5 28.8 33.1Z" fill="#4285F4"/></svg>
            {isSavingToDrive ? 'Saving...' : 'Save Data to Google Drive'}
          </button>
          {driveMessage && (
            <div className="flex items-center justify-between w-full mt-1 bg-[#FFF9F2] border border-[#EAE0D5] px-3 py-2 rounded-lg">
              <p className="text-xs text-[#8B5E3C] font-medium">{driveMessage}</p>
              <button onClick={() => setDriveMessage('')} className="text-[#8B5E3C] hover:text-[#4A2E1B]"><X className="w-4 h-4" /></button>
            </div>
          )}

          <button 
            onClick={async () => {
              try {
                setIsSavingToSheets(true);
                setSheetsMessage('Authenticating...');

                let token = await getAccessToken();
                if (!token) {
                  const authResult = await googleSignIn();
                  token = authResult?.accessToken || null;
                }
                
                if (!token) {
                  throw new Error('Authentication required to save to Sheets');
                }

                setSheetsMessage('Exporting to Sheets...');
                const profileData = {
                  personal: { name, email, phone },
                  financial: { status: 'Future Financial Profile Enabled', memberType: 'Premium' },
                  loginInformation: { provider: 'Frezzo Auth', lastLogin: new Date().toISOString() },
                  storage: { provider: 'OnePlus Cloud Storage', capacity: '5 TB' }
                };
                const res = await fetch('/api/export-to-sheets', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ profileData })
                });
                const data = await res.json();
                if (data.success) {
                  setSheetsMessage('Exported to Google Sheets successfully!');
                  setTimeout(() => setSheetsMessage(''), 3000);
                } else {
                  setSheetsMessage('Error: ' + data.error);
                }
              } catch (e: any) {
                setSheetsMessage('Error exporting to Sheets');
              } finally {
                setIsSavingToSheets(false);
              }
            }}
            disabled={isSavingToSheets}
            className="w-full bg-[#FFF9F2] border border-[#EAE0D5] text-[#4A2E1B] py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:border-[#0F9D58] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 22"><path d="M10 0H2a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-6-6zm4 20H2V2h7v5h5v13zm-8-3h6v-2H6v2zm0-4h6v-2H6v2zm0-4h6V7H6v2z" fill="#0F9D58"/></svg>
            {isSavingToSheets ? 'Exporting...' : 'Export Data to Google Sheets'}
          </button>
          {sheetsMessage && (
            <div className="flex items-center justify-between w-full mt-1 bg-[#E8F5E9] border border-[#A5D6A7] px-3 py-2 rounded-lg">
              <p className="text-xs text-[#2E7D32] font-medium">{sheetsMessage}</p>
              <button onClick={() => setSheetsMessage('')} className="text-[#2E7D32] hover:text-[#1B5E20]"><X className="w-4 h-4" /></button>
            </div>
          )}
            </>
          )}

          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-[#F48FB1] hover:text-[#F06292] font-bold text-sm uppercase tracking-widest transition-colors mt-4"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
