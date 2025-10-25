import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import Switch from '../components/ui/Switch';
import Select from '../components/ui/Select';
import { UploadCloud, Save, Sun, Moon } from 'lucide-react';

interface AgencySettings {
    name: string;
    logoUrl: string;
    primaryColor: string;
}

const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<AgencySettings>({
        name: 'Telya Agency',
        logoUrl: '',
        primaryColor: '#00592e',
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('telya_agency_settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            setSettings(parsedSettings);
            if (parsedSettings.logoUrl) {
                setLogoPreview(parsedSettings.logoUrl);
            }
        }
        
        const currentTheme = localStorage.getItem('telya_theme');
        setIsDarkMode(currentTheme === 'dark');

        const savedLanguage = localStorage.getItem('telya_language') || 'en';
        setLanguage(savedLanguage);

    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                setSettings(prev => ({ ...prev, logoUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleThemeToggle = (checked: boolean) => {
        setIsDarkMode(checked);
        const theme = checked ? 'dark' : 'light';
        localStorage.setItem('telya_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        localStorage.setItem('telya_language', newLang);
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    const handleSave = () => {
        localStorage.setItem('telya_agency_settings', JSON.stringify(settings));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
    <>
        <div>
            <h1 className="text-3xl font-bold text-foreground">Agency Settings</h1>
            <p className="mt-1 text-muted-foreground">Customize the look and feel of your Telya portal.</p>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="space-y-6">
                            <Input 
                                label="Agency Name"
                                id="name"
                                name="name"
                                value={settings.name}
                                onChange={handleInputChange}
                            />
                            
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Agency Logo</label>
                                <div className="flex items-center space-x-6">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 rounded-lg object-contain bg-secondary p-1" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                            Logo
                                        </div>
                                    )}
                                    <label htmlFor="logo-upload" className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent">
                                        <UploadCloud className="w-6 h-6 text-muted-foreground mr-3" />
                                        <span className="text-sm text-muted-foreground">Click to upload a new logo</span>
                                    </label>
                                    <input id="logo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </div>
                            </div>

                             <Input 
                                label="Primary Accent Color"
                                id="primaryColor"
                                name="primaryColor"
                                type="color"
                                value={settings.primaryColor}
                                onChange={handleInputChange}
                                className="p-1 h-10"
                            />

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSave}>
                                   <Save className="w-5 h-5 mr-2" /> Save Settings
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
                 <div>
                    <div className="space-y-8">
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Theme</h3>
                            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center">
                                    { isDarkMode ? <Moon className="w-5 h-5 text-muted-foreground mr-3" /> : <Sun className="w-5 h-5 text-muted-foreground mr-3" /> }
                                    <span className="font-semibold">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                                </div>
                                <Switch checked={isDarkMode} onChange={handleThemeToggle} />
                            </div>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Application Language</h3>
                            <Select value={language} onChange={handleLanguageChange}>
                                <option value="en">English</option>
                                <option value="ar">العربية (Arabic)</option>
                            </Select>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

        <Toast message="Settings saved successfully!" show={showToast} />
    </>
    );
};

export default AdminSettings;