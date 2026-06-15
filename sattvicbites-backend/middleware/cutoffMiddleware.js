import Settings from '../models/Settings.js';

// Helper: Get details in Indian Standard Time (IST)
const getISTTimeDetails = () => {
  const now = new Date();
  try {
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    
    // YYYY-MM-DD string helper
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    return {
      hours: istDate.getHours(),
      minutes: istDate.getMinutes(),
      dateString,
      istDate
    };
  } catch (error) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      dateString: `${year}-${month}-${day}`,
      istDate: now
    };
  }
};

export const validateCutoffs = async (req, res, next) => {
  try {
    const { orderType, mealType, gujaratiCustomVariant, deliveryDate } = req.body;

    // 1. Fetch active settings (create defaults if document is absent)
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        lunchCutoffTime: '10:00',
        dinnerCutoffTime: '17:00'
      });
    }

    const { hours, minutes, dateString } = getISTTimeDetails();
    const currentTimeMinutes = (hours * 60) + minutes;

    // 2. Validate Tiffin Orders
    if (orderType === 'Tiffin' || !orderType) {
      if (mealType === 'Lunch') {
        const [startHour, startMin] = (settings.lunchOrderTime || '08:00').split(':').map(Number);
        const startTimeMinutes = (startHour * 60) + startMin;
        const [cutoffHour, cutoffMin] = (settings.lunchCutoffTime || '10:00').split(':').map(Number);
        const cutoffTimeMinutes = (cutoffHour * 60) + cutoffMin;

        if (currentTimeMinutes < startTimeMinutes) {
          return res.status(400).json({
            message: `Lunch tiffin ordering is not open yet. Submissions are open between ${settings.lunchOrderTime || '08:00'} and ${settings.lunchCutoffTime || '10:00'} IST. Current server time is ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST.`
          });
        }

        if (currentTimeMinutes >= cutoffTimeMinutes) {
          return res.status(400).json({
            message: `Lunch tiffin order cutoff exceeded. Submissions close at ${settings.lunchCutoffTime || '10:00'} IST. Current server time is ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST.`
          });
        }

        // Night-only items validation: check if Gujarati Khichdi / Bhaat is selected for lunch
        if (gujaratiCustomVariant && gujaratiCustomVariant !== 'None') {
          return res.status(400).json({
            message: `Invalid Accompaniment: Traditional Customizer items (Khichdi & Bhaat) are restricted exclusively to Night (Dinner) tiffins.`
          });
        }
      } 
      
      else if (mealType === 'Dinner') {
        const [startHour, startMin] = (settings.dinnerOrderTime || '15:00').split(':').map(Number);
        const startTimeMinutes = (startHour * 60) + startMin;
        const [cutoffHour, cutoffMin] = (settings.dinnerCutoffTime || '17:00').split(':').map(Number);
        const cutoffTimeMinutes = (cutoffHour * 60) + cutoffMin;

        if (currentTimeMinutes < startTimeMinutes) {
          return res.status(400).json({
            message: `Dinner tiffin ordering is not open yet. Submissions are open between ${settings.dinnerOrderTime || '15:00'} and ${settings.dinnerCutoffTime || '17:00'} IST. Current server time is ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST.`
          });
        }

        if (currentTimeMinutes >= cutoffTimeMinutes) {
          return res.status(400).json({
            message: `Dinner tiffin order cutoff exceeded. Submissions close at ${settings.dinnerCutoffTime || '17:00'} IST. Current server time is ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST.`
          });
        }
      }
    }

    // 3. Validate Special Dishes (Handvo, Thepla, etc.)
    else if (orderType === 'SpecialDish') {
      // Determine if order is same-day
      let isSameDay = true;
      if (deliveryDate) {
        const targetDate = new Date(deliveryDate);
        const targetYear = targetDate.getFullYear();
        const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
        const targetDay = String(targetDate.getDate()).padStart(2, '0');
        const targetDateString = `${targetYear}-${targetMonth}-${targetDay}`;
        
        isSameDay = (targetDateString === dateString);
        
        // Block booking in the past
        if (targetDateString < dateString) {
          return res.status(400).json({ message: 'Delivery date cannot be in the past.' });
        }
      }

      // If ordering same-day, it must be placed in the morning (before 10:00 AM)
      if (isSameDay) {
        if (hours >= 10) {
          return res.status(400).json({
            message: `Same-day Special Dishes (Handvo, Thepla, etc.) can only be booked before 10:00 AM IST. Please schedule for tomorrow or order earlier.`
          });
        }
      }
    }

    next();

  } catch (error) {
    console.error(`[Cutoff Middleware Error] ${error.message}`);
    return res.status(500).json({ message: 'Internal server failure executing time boundary audits.' });
  }
};
