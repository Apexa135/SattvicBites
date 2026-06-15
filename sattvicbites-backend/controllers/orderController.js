import Order from '../models/Order.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

// @desc    Create a new tiffin or special dish order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      orderType,
      mealType,
      tiffinCount,
      tiffinPlan,
      accompaniment,
      gujaratiCustomVariant,
      spiceLevel,
      specialRequests,
      paymentMethod,
      transactionRef,
      deliveryAddress,
      streetAddress,
      city,
      pincode,
      specialDishItem,
      specialDishQty,
      deliveryDate,
      locationCoordinates,
      rotisCountSelection,
      sabjiSelection,
      extraRotisCount
    } = req.body;

    // Validate essential inputs
    if (!paymentMethod || !deliveryAddress || !city || !pincode) {
      return res.status(400).json({ message: 'Missing essential order input parameters' });
    }

    if (orderType === 'SpecialDish') {
      if (!specialDishItem || !specialDishQty || specialDishQty < 1) {
        return res.status(400).json({ message: 'Please specify the special dish item and quantity' });
      }
    } else {
      if (!mealType || !tiffinCount) {
        return res.status(400).json({ message: 'Please specify meal type and tiffin quantity' });
      }
    }

    // Double check geofence boundary cross-match
    const allowedAreas = {
      'Vallabh Vidyanagar': '388120',
      'Karamsad': '388325'
    };

    if (!allowedAreas[city] || allowedAreas[city] !== pincode) {
      return res.status(400).json({ 
        message: 'Delivery geofencing violation: Selected city must match boundary pincode.' 
      });
    }

    // Kitchen Daily Limit capacity check & Extra Rotis limit check
    if (orderType === 'Tiffin' || !orderType) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }

      // Validate extra rotis limit
      const maxRotis = settings.maxExtraRotis || 5;
      if (extraRotisCount && extraRotisCount > maxRotis) {
        return res.status(400).json({
          message: `You cannot order more than ${maxRotis} extra rotis.`
        });
      }

      const limit = mealType === 'Lunch' 
        ? (settings.lunchDailyLimit || 20) 
        : (settings.dinnerDailyLimit || 20);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const todayOrders = await Order.find({
        orderType: 'Tiffin',
        mealType: mealType,
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });

      const totalTiffinsToday = todayOrders.reduce((sum, o) => sum + (o.tiffinCount || 0), 0);
      const requestedTiffins = parseInt(tiffinCount) || 1;

      if (totalTiffinsToday + requestedTiffins > limit) {
        return res.status(400).json({
          message: "our service is full for today so we cannot provide you tiffin srry for the inconvinence caused we are trying to expand our limit so that we can serve you soon. You can try to order our servive in other timings than this."
        });
      }
    } else if (orderType === 'SpecialDish') {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }

      const limit = settings.specialDishDailyLimit || 20;
      const cutoffTimeStr = settings.specialDishCutoffTime || '10:00';

      const reqDeliveryDate = new Date(deliveryDate || new Date());
      
      const now = new Date();
      const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const reqIST = new Date(reqDeliveryDate.getTime() + (5.5 * 60 * 60 * 1000));
      
      const isToday = nowIST.getUTCFullYear() === reqIST.getUTCFullYear() &&
                      nowIST.getUTCMonth() === reqIST.getUTCMonth() &&
                      nowIST.getUTCDate() === reqIST.getUTCDate();

      if (isToday) {
        const [cutoffHour, cutoffMin] = cutoffTimeStr.split(':').map(Number);
        
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(now);
        const hourVal = parts.find(p => p.type === 'hour')?.value;
        const minVal = parts.find(p => p.type === 'minute')?.value;
        const currentISTHour = parseInt(hourVal || '0', 10);
        const currentISTMin = parseInt(minVal || '0', 10);

        if (currentISTHour > cutoffHour || (currentISTHour === cutoffHour && currentISTMin >= cutoffMin)) {
          return res.status(400).json({
            message: `Same-day orders for Special Gujarati Dishes must be placed before ${cutoffTimeStr} IST.`
          });
        }
      }

      const startOfDeliveryDay = new Date(reqDeliveryDate);
      startOfDeliveryDay.setHours(0, 0, 0, 0);
      const endOfDeliveryDay = new Date(reqDeliveryDate);
      endOfDeliveryDay.setHours(23, 59, 59, 999);

      const scheduledOrders = await Order.find({
        orderType: 'SpecialDish',
        adminApproval: { $ne: 'Rejected' },
        deliveryDate: { $gte: startOfDeliveryDay, $lte: endOfDeliveryDay }
      });

      const currentTotalQty = scheduledOrders.reduce((sum, o) => sum + (o.specialDishQty || 0), 0);
      const requestedQty = parseInt(specialDishQty) || 1;

      if (currentTotalQty + requestedQty > limit) {
        const formattedDate = new Date(reqDeliveryDate).toLocaleDateString();
        return res.status(400).json({
          message: `Special dishes kitchen capacity is full for ${formattedDate}. Limit is ${limit} portions.`
        });
      }
    }

    // Determine initial payment status based on method (no UTR required)
    let paymentStatus = 'Pending';
    if (paymentMethod === 'Online') {
      paymentStatus = 'Pending Verification';
    }

    // Build the order document (pricing, chaas hooks run in pre-save)
    const order = new Order({
      user: req.user._id,
      orderType: orderType || 'Tiffin',
      mealType: mealType,
      tiffinCount: orderType === 'SpecialDish' ? 0 : tiffinCount,
      tiffinPlan: orderType === 'SpecialDish' ? 'None' : (tiffinPlan || 'Single'),
      extraRotisCount: orderType === 'SpecialDish' ? 0 : (extraRotisCount || 0),
      accompaniment: orderType === 'SpecialDish' ? 'None' : (accompaniment || 'Dal-Rice'),
      gujaratiCustomVariant: orderType === 'SpecialDish' ? 'None' : (gujaratiCustomVariant || 'None'),
      rotisCountSelection: orderType === 'SpecialDish' ? '' : (rotisCountSelection || ''),
      sabjiSelection: orderType === 'SpecialDish' ? '' : (sabjiSelection || ''),
      spiceLevel: spiceLevel || 'Mid',
      specialRequests,
      paymentMethod,
      paymentStatus,
      transactionRef: transactionRef || '',
      deliveryAddress,
      city,
      pincode,
      specialDishItem: orderType === 'SpecialDish' ? specialDishItem : 'None',
      specialDishQty: orderType === 'SpecialDish' ? specialDishQty : 0,
      adminApproval: 'Pending', // All orders are initially Pending Approval
      deliveryDate: deliveryDate || new Date(),
      locationCoordinates
    });

    const savedOrder = await order.save();

    // Persist/Update the user's default address if changed/provided
    if (streetAddress && req.user) {
      const streetAddressText = streetAddress.trim();
      if (streetAddressText && req.user.streetAddress !== streetAddressText) {
        await User.findByIdAndUpdate(req.user._id, { streetAddress: streetAddressText });
      }
    }

    return res.status(201).json(savedOrder);

  } catch (error) {
    console.error(`[Order Create Error] ${error.message}`);
    return res.status(500).json({ message: `Server failure placing order: ${error.message}` });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for admin dispatch view
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email city pincode')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Verify/Update payment status for online orders
// @route   PUT /api/orders/admin/verify/:id
// @access  Private/Admin
export const verifyOrderPayment = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Paid', 'Pending', 'Pending Verification'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status update input' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.paymentStatus = status;
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject any order
// @route   PUT /api/orders/admin/approve/:id
// @access  Private/Admin
export const approveOrder = async (req, res) => {
  try {
    const { approvalStatus } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Approval status must be Approved or Rejected' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.adminApproval = approvalStatus;
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Mark order as delivered (archive to past orders)
// @route   PUT /api/orders/admin/deliver/:id
// @access  Private/Admin
export const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all active orders for the day as delivered
// @route   PUT /api/orders/admin/deliver-all
// @access  Private/Admin
export const deliverAllOrders = async (req, res) => {
  try {
    const { category } = req.body; // 'SpecialDish', 'Anand' (Karamsad), 'Vidhyanagar' (Vallabh Vidyanagar)
    let query = { isDelivered: false, adminApproval: 'Approved' };

    if (category === 'SpecialDish') {
      query.orderType = 'SpecialDish';
    } else if (category === 'Anand') {
      query.orderType = 'Tiffin';
      query.city = 'Karamsad';
    } else if (category === 'Vidhyanagar') {
      query.orderType = 'Tiffin';
      query.city = 'Vallabh Vidyanagar';
    } else {
      // Default fallback: match all active orders
      query.isDelivered = false;
    }

    const result = await Order.updateMany(query, { isDelivered: true });
    return res.json({ message: `${result.modifiedCount} orders marked as delivered.` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
