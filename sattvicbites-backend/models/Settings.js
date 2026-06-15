import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  lunchOrderTime: {
    type: String,
    required: true,
    default: '08:00',
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid 24h time format (HH:MM)!`
    }
  },
  lunchCutoffTime: {
    type: String,
    required: true,
    default: '10:00',
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid 24h time format (HH:MM)!`
    }
  },
  dinnerOrderTime: {
    type: String,
    required: true,
    default: '15:00',
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid 24h time format (HH:MM)!`
    }
  },
  dinnerCutoffTime: {
    type: String,
    required: true,
    default: '17:00',
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid 24h time format (HH:MM)!`
    }
  },
  lunchDailyLimit: {
    type: Number,
    required: true,
    default: 20
  },
  dinnerDailyLimit: {
    type: Number,
    required: true,
    default: 20
  },
  maxExtraRotis: {
    type: Number,
    required: true,
    default: 5
  },
  helplineNumber: {
    type: String,
    default: '+91 98765 43210'
  },
  communityLink: {
    type: String,
    default: 'https://community.sattvicbites.com'
  },
  discordLink: {
    type: String,
    default: 'https://discord.gg/sattvicbites'
  },
  additionalNumbers: {
    type: [String],
    default: []
  },
  additionalLinks: {
    type: [{
      label: { type: String, required: true },
      url: { type: String, required: true }
    }],
    default: []
  },
  // Day Menu Configuration
  dayRotis: {
    type: String,
    default: '6 Hot Ghee Rotis'
  },
  daySabji: {
    type: String,
    default: 'Seasonal Sabji'
  },
  dayAccompaniment: {
    type: String,
    default: 'Dal-Rice'
  },
  dayImage: {
    type: String,
    default: ''
  },
  // Night Menu Configuration
  nightRotis: {
    type: String,
    default: '6 Hot Ghee Rotis'
  },
  nightSabji: {
    type: String,
    default: 'Seasonal Sabji'
  },
  nightAccompaniment: {
    type: String,
    default: 'Dal-Rice'
  },
  nightImage: {
    type: String,
    default: ''
  },
  // Dynamic drop-down list items configured by Admin
  lunchRotisOptions: {
    type: [String],
    default: ['6 Rotis', '8 Rotis', '10 Rotis']
  },
  lunchSabjisOptions: {
    type: [String],
    default: ['Seasonal Sabji (Alu Palak)', 'Double Sabji (Alu Palak & Paneer)']
  },
  dinnerRotisOptions: {
    type: [String],
    default: ['6 Rotis', '8 Rotis', '10 Rotis']
  },
  dinnerSabjisOptions: {
    type: [String],
    default: ['Seasonal Sabji (Alu Palak)', 'Double Sabji (Alu Palak & Paneer)']
  },
  lunchCustomOptions: {
    type: [String],
    default: ['None', 'Vaghareli Khichdi & Chaas', 'Saadi Kadhi-Khichdi & Chaas', 'Vagharela Bhaat & Chaas']
  },
  dinnerCustomOptions: {
    type: [String],
    default: ['None', 'Vaghareli Khichdi & Chaas', 'Saadi Kadhi-Khichdi & Chaas', 'Vagharela Bhaat & Chaas']
  },
  // Admin Payment Configuration
  paymentQRCode: {
    type: String,
    default: ''
  },
  // Special Gujarati Dishes Configuration
  specialDishesOptions: {
    type: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, default: 0 },
      unit: { type: String, default: '' }
    }],
    default: [
      { name: 'Handvo', price: 60, unit: 'plate' },
      { name: 'Thepla', price: 40, unit: '5 pcs' },
      { name: 'Tikhi Puri', price: 40, unit: 'plate' },
      { name: 'Aloo Paratha', price: 50, unit: '2 pcs' }
    ]
  },
  specialDishCutoffTime: {
    type: String,
    required: true,
    default: '10:00',
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid 24h time format (HH:MM)!`
    }
  },
  specialDishDailyLimit: {
    type: Number,
    required: true,
    default: 20
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
