import Settings from '../models/Settings.js';

// @desc    Get active settings configuration
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
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
        dayImage: '',
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
        paymentQRCode: '',
        specialDishesOptions: [
          { name: 'Handvo', price: 60, unit: 'plate' },
          { name: 'Thepla', price: 40, unit: '5 pcs' },
          { name: 'Tikhi Puri', price: 40, unit: 'plate' },
          { name: 'Aloo Paratha', price: 50, unit: '2 pcs' }
        ],
        specialDishCutoffTime: '10:00',
        specialDishDailyLimit: 20
      });
    }
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings configuration (Cutoffs, Daily Menu, Dropdowns, QR)
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const {
      lunchOrderTime,
      lunchCutoffTime,
      dinnerOrderTime,
      dinnerCutoffTime,
      lunchDailyLimit,
      dinnerDailyLimit,
      maxExtraRotis,
      helplineNumber,
      communityLink,
      discordLink,
      dayRotis,
      daySabji,
      dayAccompaniment,
      dayImage,
      nightRotis,
      nightSabji,
      nightAccompaniment,
      nightImage,
      lunchRotisOptions,
      lunchSabjisOptions,
      dinnerRotisOptions,
      dinnerSabjisOptions,
      lunchCustomOptions,
      dinnerCustomOptions,
      paymentQRCode,
      additionalNumbers,
      additionalLinks,
      specialDishesOptions,
      specialDishCutoffTime,
      specialDishDailyLimit
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (lunchOrderTime !== undefined) settings.lunchOrderTime = lunchOrderTime;
    if (lunchCutoffTime !== undefined) settings.lunchCutoffTime = lunchCutoffTime;
    if (dinnerOrderTime !== undefined) settings.dinnerOrderTime = dinnerOrderTime;
    if (dinnerCutoffTime !== undefined) settings.dinnerCutoffTime = dinnerCutoffTime;
    if (lunchDailyLimit !== undefined) settings.lunchDailyLimit = Number(lunchDailyLimit);
    if (dinnerDailyLimit !== undefined) settings.dinnerDailyLimit = Number(dinnerDailyLimit);
    if (maxExtraRotis !== undefined) settings.maxExtraRotis = Number(maxExtraRotis);
    if (helplineNumber !== undefined) settings.helplineNumber = helplineNumber;
    if (communityLink !== undefined) settings.communityLink = communityLink;
    if (discordLink !== undefined) settings.discordLink = discordLink;
    if (dayRotis !== undefined) settings.dayRotis = dayRotis;
    if (daySabji !== undefined) settings.daySabji = daySabji;
    if (dayAccompaniment !== undefined) settings.dayAccompaniment = dayAccompaniment;
    if (dayImage !== undefined) settings.dayImage = dayImage;
    if (nightRotis !== undefined) settings.nightRotis = nightRotis;
    if (nightSabji !== undefined) settings.nightSabji = nightSabji;
    if (nightAccompaniment !== undefined) settings.nightAccompaniment = nightAccompaniment;
    if (nightImage !== undefined) settings.nightImage = nightImage;
    if (lunchRotisOptions !== undefined) settings.lunchRotisOptions = lunchRotisOptions;
    if (lunchSabjisOptions !== undefined) settings.lunchSabjisOptions = lunchSabjisOptions;
    if (dinnerRotisOptions !== undefined) settings.dinnerRotisOptions = dinnerRotisOptions;
    if (dinnerSabjisOptions !== undefined) settings.dinnerSabjisOptions = dinnerSabjisOptions;
    if (lunchCustomOptions !== undefined) settings.lunchCustomOptions = lunchCustomOptions;
    if (dinnerCustomOptions !== undefined) settings.dinnerCustomOptions = dinnerCustomOptions;
    if (paymentQRCode !== undefined) settings.paymentQRCode = paymentQRCode;
    if (additionalNumbers !== undefined) settings.additionalNumbers = additionalNumbers;
    if (additionalLinks !== undefined) settings.additionalLinks = additionalLinks;
    if (specialDishesOptions !== undefined) settings.specialDishesOptions = specialDishesOptions;
    if (specialDishCutoffTime !== undefined) settings.specialDishCutoffTime = specialDishCutoffTime;
    if (specialDishDailyLimit !== undefined) settings.specialDishDailyLimit = Number(specialDishDailyLimit);

    const updatedSettings = await settings.save();
    return res.json(updatedSettings);

  } catch (error) {
    console.error(`[Settings Update Error] ${error.message}`);
    return res.status(400).json({ message: error.message || 'Validation failed updating settings.' });
  }
};
