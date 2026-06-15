import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.js';

dotenv.config();

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sattvicbites';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');
    
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('No settings document found. Creating default settings...');
      settings = new Settings({
        lunchOrderTime: '08:00',
        lunchCutoffTime: '10:00',
        dinnerOrderTime: '15:00',
        dinnerCutoffTime: '17:00',
        lunchDailyLimit: 20,
        dinnerDailyLimit: 20,
        maxExtraRotis: 5,
        helplineNumber: '+91 98765 43210',
        communityLink: 'https://community.sattvicbites.com',
        discordLink: 'https://discord.gg/sattvicbites',
        dayRotis: '6 Hot Ghee Rotis',
        daySabji: 'Seasonal Sabji (Alu Palak)',
        dayAccompaniment: 'Dal-Rice',
        dayImage: '/daytime_menu.jpg',
        nightRotis: '6 Hot Ghee Rotis',
        nightSabji: 'Seasonal Sabji (Alu Palak)',
        nightAccompaniment: 'Dal-Rice',
        nightImage: '',
        lunchRotisOptions: ['6 Rotis', '8 Rotis', '10 Rotis'],
        lunchSabjisOptions: ['Seasonal Sabji (Alu Palak)', 'Double Sabji (Alu Palak & Paneer)'],
        dinnerRotisOptions: ['6 Rotis', '8 Rotis', '10 Rotis'],
        dinnerSabjisOptions: ['Seasonal Sabji (Alu Palak)', 'Double Sabji (Alu Palak & Paneer)'],
        lunchCustomOptions: ['None', 'Vaghareli Khichdi & Chaas', 'Saadi Kadhi-Khichdi & Chaas', 'Vagharela Bhaat & Chaas'],
        dinnerCustomOptions: ['None', 'Vaghareli Khichdi & Chaas', 'Saadi Kadhi-Khichdi & Chaas', 'Vagharela Bhaat & Chaas'],
        paymentQRCode: ''
      });
    } else {
      settings.dayImage = '/daytime_menu.jpg';
    }
    
    await settings.save();
    console.log('Daytime menu image updated successfully to /daytime_menu.jpg');
  } catch (err) {
    console.error('Error updating settings:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
