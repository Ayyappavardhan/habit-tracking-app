/**
 * Icon Data for Habit Icon Picker
 * 250+ Phosphor Icons organized by category
 */

// Icon category type
export interface IconCategory {
    name: string;
    icons: string[];
}

// All available icons organized by category
export const iconCategories: IconCategory[] = [
    {
        name: 'Health & Fitness',
        icons: [
            'Heart', 'Heartbeat', 'FirstAid', 'Pill', 'Thermometer',
            'Barbell', 'PersonSimpleRun', 'PersonSimpleWalk', 'PersonSimpleBike', 'Bicycle',
            'FigmaLogo', 'FootballHelmet', 'Basketball', 'Baseball', 'SoccerBall',
            'Tennis', 'Golf', 'Volleyball', 'SwimmingPool', 'PersonSimpleSwim',
            'Sneaker', 'Dumbbell', 'Timer', 'Stopwatch', 'Pulse',
        ],
    },
    {
        name: 'Mindfulness',
        icons: [
            'Brain', 'Flower', 'FlowerLotus', 'Leaf', 'Tree',
            'Moon', 'MoonStars', 'Sun', 'SunHorizon', 'Cloud',
            'CloudSun', 'Rainbow', 'Sparkle', 'Star', 'StarFour',
            'YinYang', 'Peace', 'HandsPraying', 'Eye', 'EyeClosed',
        ],
    },
    {
        name: 'Productivity',
        icons: [
            'Briefcase', 'Laptop', 'Desktop', 'PencilSimple', 'Pen',
            'PenNib', 'Notebook', 'NotePencil', 'ClipboardText', 'Calendar',
            'CalendarCheck', 'CalendarBlank', 'Clock', 'Alarm', 'Timer',
            'ListChecks', 'ListBullets', 'CheckSquare', 'CheckCircle', 'Checks',
            'Target', 'Crosshair', 'Flag', 'FlagBanner', 'Trophy',
        ],
    },
    {
        name: 'Food & Drink',
        icons: [
            'Coffee', 'CoffeePot', 'TeaBag', 'BeerBottle', 'BeerStein',
            'WineGlass', 'Wine', 'Martini', 'Cocktail', 'Drop',
            'DropHalf', 'Droplet', 'CookingPot', 'ForkKnife', 'Knife',
            'Bowl', 'Hamburger', 'Pizza', 'IceCream', 'Cookie',
            'Carrot', 'Apple', 'OrangeSlice', 'Lemon', 'Egg',
        ],
    },
    {
        name: 'Education',
        icons: [
            'Book', 'Books', 'BookOpen', 'BookBookmark', 'Bookmarks',
            'GraduationCap', 'Student', 'Chalkboard', 'ChalkboardTeacher', 'Notebook',
            'Article', 'Newspaper', 'Files', 'File', 'FileText',
            'Highlighter', 'PencilCircle', 'Ruler', 'MathOperations', 'Lightbulb',
        ],
    },
    {
        name: 'Communication',
        icons: [
            'Chat', 'ChatCircle', 'ChatText', 'ChatCenteredText', 'Chats',
            'Phone', 'PhoneCall', 'PhoneIncoming', 'VideoCamera', 'Webcam',
            'Envelope', 'EnvelopeSimple', 'PaperPlane', 'PaperPlaneTilt', 'At',
            'Users', 'UsersThree', 'UserCircle', 'User', 'UserPlus',
            'Globe', 'GlobeHemisphereWest', 'Translate', 'Megaphone', 'Bell',
        ],
    },
    {
        name: 'Entertainment',
        icons: [
            'MusicNote', 'MusicNotes', 'MusicNoteSimple', 'Microphone', 'Headphones',
            'SpeakerHigh', 'Radio', 'Guitar', 'Piano', 'Disc',
            'GameController', 'Joystick', 'Dice', 'PuzzlePiece', 'Cards',
            'FilmSlate', 'FilmStrip', 'VideoCamera', 'Monitor', 'Television',
            'PaintBrush', 'Palette', 'Pencil', 'Camera', 'InstagramLogo',
        ],
    },
    {
        name: 'Finance',
        icons: [
            'CurrencyDollar', 'CurrencyEur', 'CurrencyCircleDollar', 'Money', 'Wallet',
            'CreditCard', 'Bank', 'PiggyBank', 'Coins', 'Receipt',
            'ChartLine', 'ChartLineUp', 'ChartBar', 'ChartPie', 'TrendUp',
            'Percent', 'Calculator', 'Scales', 'Vault', 'Handshake',
        ],
    },
    {
        name: 'Home & Life',
        icons: [
            'House', 'HouseSimple', 'HouseLine', 'Buildings', 'BuildingOffice',
            'Bed', 'Bathtub', 'Shower', 'Toilet', 'Couch',
            'Lamp', 'LightbulbFilament', 'FanBlades', 'ThermometerSimple', 'Key',
            'Door', 'DoorOpen', 'Plant', 'PottedPlant', 'FlowerPot',
            'Dog', 'Cat', 'Bird', 'Fish', 'PawPrint',
        ],
    },
    {
        name: 'Travel',
        icons: [
            'Airplane', 'AirplaneTilt', 'AirplaneTakeoff', 'AirplaneLanding', 'Car',
            'CarSimple', 'Taxi', 'Bus', 'Train', 'Subway',
            'Boat', 'Sailboat', 'Anchor', 'Compass', 'MapPin',
            'MapTrifold', 'Navigation', 'Mountains', 'Tent', 'Campfire',
            'Suitcase', 'SuitcaseRolling', 'Backpack', 'Ticket', 'Passport',
        ],
    },
    {
        name: 'Technology',
        icons: [
            'Cpu', 'HardDrives', 'Database', 'CloudArrowUp', 'CloudArrowDown',
            'Wifi', 'WifiHigh', 'Bluetooth', 'Usb', 'PlugsConnected',
            'DeviceMobile', 'Tablet', 'Keyboard', 'Mouse', 'Printer',
            'Code', 'CodeBlock', 'Terminal', 'BracketsCurly', 'Bug',
            'Robot', 'DesktopTower', 'Monitor', 'ComputerTower', 'CircuitBoard',
        ],
    },
    {
        name: 'General',
        icons: [
            'Lightning', 'LightningSlash', 'Fire', 'Flame', 'Snowflake',
            'ThumbsUp', 'ThumbsDown', 'HandPointing', 'Clap', 'HandWaving',
            'Smiley', 'SmileyWink', 'SmileyXEyes', 'Alien', 'Ghost',
            'Medal', 'Crown', 'DiamondsFour', 'ShoppingCart', 'Gift',
            'Balloon', 'Confetti', 'PartyPopper', 'Rocket', 'Atom',
            'Magnet', 'Wrench', 'Hammer', 'Scissors', 'PaintBucket',
            'Recycle', 'ShieldCheck', 'Lock', 'LockOpen', 'Fingerprint',
        ],
    },
];

// Flat array of all icon names for easy lookup
export const allIconNames: string[] = iconCategories.flatMap(cat => cat.icons);

// Total count for reference
export const TOTAL_ICONS = allIconNames.length;

// Default icon
export const DEFAULT_ICON = 'Star';

// Popular habits with their suggested icons and default goals
export interface PopularHabit {
    name: string;
    icon: string;
    goal: number;
    unit: string;
    category: string;
}

export const popularHabitIcons: PopularHabit[] = [
    { name: 'Drink Water', icon: 'Drop', goal: 8, unit: 'glasses', category: 'health' },
    { name: 'Read Books', icon: 'BookOpen', goal: 30, unit: 'minutes', category: 'learning' },
    { name: 'Exercise', icon: 'Barbell', goal: 30, unit: 'minutes', category: 'fitness' },
    { name: 'Meditate', icon: 'FlowerLotus', goal: 10, unit: 'minutes', category: 'mindfulness' },
    { name: 'Wake Up Early', icon: 'SunHorizon', goal: 1, unit: 'times', category: 'lifestyle' },
    { name: 'Walk', icon: 'PersonSimpleWalk', goal: 5000, unit: 'steps', category: 'fitness' },
    { name: 'Run', icon: 'PersonSimpleRun', goal: 3, unit: 'km', category: 'fitness' },
    { name: 'Journal', icon: 'NotePencil', goal: 1, unit: 'pages', category: 'mindfulness' },
    { name: 'Learn', icon: 'GraduationCap', goal: 30, unit: 'minutes', category: 'learning' },
    { name: 'Cook', icon: 'CookingPot', goal: 1, unit: 'meals', category: 'health' },
    { name: 'Sleep Early', icon: 'Moon', goal: 8, unit: 'hours', category: 'health' },
    { name: 'Practice Guitar', icon: 'Guitar', goal: 20, unit: 'minutes', category: 'skills' },
];
