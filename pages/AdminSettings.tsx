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
    primaryColorHex: string;
    primaryColorHsl: string;
}

// Utility function to convert HEX to HSL string
function hexToHsl(H: string): string {
    let r = 0, g = 0, b = 0;
    if (H.length === 4) {
        r = parseInt(H[1] + H[1], 16);
        g = parseInt(H[2] + H[2], 16);
        b = parseInt(H[3] + H[3], 16);
    } else if (H.length === 7) {
        r = parseInt(H.substring(1, 3), 16);
        g = parseInt(H.substring(3, 5), 16);
        b = parseInt(H.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
    let h = 0, s = 0, l = 0;
    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return `${h} ${s}% ${l}%`;
}


const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<AgencySettings>({
        name: 'Telya Agency',
        logoUrl: '',
        primaryColorHex: '#00592e',
        primaryColorHsl: '147 100% 18%',
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    // Load settings from localStorage on component mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('telya_agency_settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            setSettings(parsedSettings);
            if (parsedSettings.logoUrl) {
                setLogoPreview(parsedSettings.logoUrl);
            }
            if (parsedSettings.primaryColorHsl) {
                 document.documentElement.style.setProperty('--primary', parsedSettings.primaryColorHsl);
            }
        }
        
        const currentTheme = localStorage.getItem('telya_theme');
        setIsDarkMode(currentTheme === 'dark');

        const savedLanguage = localStorage.getItem('telya_language') || 'en';
        setLanguage(savedLanguage);

    }, []);
    
    // Apply color change in real-time
    useEffect(() => {
        document.documentElement.style.setProperty('--primary', settings.primaryColorHsl);
    }, [settings.primaryColorHsl]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        const hsl = hexToHsl(hex);
        setSettings(prev => ({
            ...prev,
            primaryColorHex: hex,
            primaryColorHsl: hsl
        }));
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
            <h1 className="text-3xl font-bold text-foreground">Paramètres de l'Agence</h1>
            <p className="mt-1 text-muted-foreground">Personnalisez l'apparence de votre portail Telya.</p>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="space-y-6">
                            <Input 
                                label="Nom de l'agence"
                                id="name"
                                name="name"
                                value={settings.name}
                                onChange={handleInputChange}
                            />
                            
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Logo de l'agence</label>
                                <div className="flex items-center space-x-6">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Aperçu du logo" className="w-16 h-16 rounded-lg object-contain bg-secondary p-1" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                            Logo
                                        </div>
                                    )}
                                    <label htmlFor="logo-upload" className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent">
                                        <UploadCloud className="w-6 h-6 text-muted-foreground mr-3" />
                                        <span className="text-sm text-muted-foreground">Cliquez pour téléverser un nouveau logo</span>
                                    </label>
                                    <input id="logo-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </div>
                            </div>

                             <Input 
                                label="Couleur d'accentuation principale"
                                id="primaryColorHex"
                                name="primaryColorHex"
                                type="color"
                                value={settings.primaryColorHex}
                                onChange={handleColorChange}
                                className="p-1 h-10"
                            />

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSave}>
                                   <Save className="w-5 h-5 mr-2" /> Enregistrer les paramètres
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
                 <div>
                    <div className="space-y-8">
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Thème</h3>
                            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center">
                                    { isDarkMode ? <Moon className="w-5 h-5 text-muted-foreground mr-3" /> : <Sun className="w-5 h-5 text-muted-foreground mr-3" /> }
                                    <span className="font-semibold">{isDarkMode ? 'Mode Sombre' : 'Mode Clair'}</span>
                                </div>
                                <Switch checked={isDarkMode} onChange={handleThemeToggle} />
                            </div>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Langue de l'application</h3>
                            <Select value={language} onChange={handleLanguageChange}>
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="ar">العربية (Arabic)</option>
                            </Select>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

        <Toast message="Paramètres enregistrés avec succès !" show={showToast} />
    </>
    );
};

export default AdminSettings;