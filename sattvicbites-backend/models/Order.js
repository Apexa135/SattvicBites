import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderType: {
    type: String,
    enum: ['Tiffin', 'SpecialDish'],
    default: 'Tiffin'
  },
  mealType: {
    type: String,
    required: function() { return this.orderType === 'Tiffin'; },
    enum: ['Lunch', 'Dinner']
  },
  tiffinCount: {
    type: Number,
    required: function() { return this.orderType === 'Tiffin'; },
    validate: {
      validator: function(v) {
        if (this.orderType === 'Tiffin') {
          return v >= 1;
        }
        return true;
      },
      message: 'Must order at least 1 tiffin box'
    },
    default: 1
  },
  tiffinPlan: {
    type: String,
    enum: ['Single', 'Couple', 'Single_SubjiRoti', 'Couple_SubjiRoti', 'None'],
    default: 'Single'
  },
  extraRotisCount: {
    type: Number,
    default: 0
  },
  accompaniment: {
    type: String,
    default: 'Dal-Rice'
  },
  gujaratiCustomVariant: {
    type: String,
    default: 'None'
  },
  rotisCountSelection: {
    type: String,
    default: ''
  },
  sabjiSelection: {
    type: String,
    default: ''
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  hasFreeChaas: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['Less', 'Mid', 'More'],
    default: 'Mid'
  },
  // Special dishes fields
  specialDishItem: {
    type: String,
    default: 'None'
  },
  specialDishQty: {
    type: Number,
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  adminApproval: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxLength: [300, 'Special requests cannot exceed 300 characters']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Online']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Pending Verification'],
    default: 'Pending'
  },
  transactionRef: {
    type: String,
    trim: true,
    default: ''
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    enum: ['Vallabh Vidyanagar', 'Karamsad']
  },
  pincode: {
    type: String,
    required: true,
    enum: ['388120', '388325']
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  deliveryDate: {
    type: Date,
    default: Date.now
  },
  locationCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, {
  timestamps: true
});

// Calculate pricing, Free Chaas, and geofence matching before saving
orderSchema.pre('save', async function (next) {
  try {
    if (this.orderType === 'Tiffin') {
      const plan = this.tiffinPlan || 'Single';
      let rate = 70;
      if (plan === 'Couple' || plan === 'Couple_SubjiRoti') {
        rate = 120;
      } else {
        rate = 70;
      }
      const extraRotisCost = 5 * (this.extraRotisCount || 0);
      this.totalPrice = (rate + extraRotisCost) * this.tiffinCount;

      // Auto buttermilk hook: Check if it's in the menu, or user selected a swap containing chaas
      let hasChaas = false;
      const customVar = (this.gujaratiCustomVariant || '').toLowerCase();
      if (customVar !== 'none' && (customVar.includes('chaas') || customVar.includes('chhas') || customVar.includes('buttermilk'))) {
        hasChaas = true;
      }

      // Check settings daily menu
      try {
        const Settings = mongoose.model('Settings');
        const settings = await Settings.findOne();
        if (settings) {
          const menuAcc = (this.mealType === 'Lunch' ? settings.dayAccompaniment : settings.nightAccompaniment) || '';
          const menuAccLower = menuAcc.toLowerCase();
          if (menuAccLower.includes('chaas') || menuAccLower.includes('chhas') || menuAccLower.includes('buttermilk')) {
            hasChaas = true;
          }
        }
      } catch (err) {
        console.error('Settings lookup error in Order pre-save hook:', err);
      }

      this.hasFreeChaas = hasChaas;
    } 
    else if (this.orderType === 'SpecialDish') {
      let rate = 0;
      try {
        const Settings = mongoose.model('Settings');
        const settings = await Settings.findOne();
        if (settings && settings.specialDishesOptions) {
          const match = settings.specialDishesOptions.find(
            opt => opt.name.toLowerCase() === this.specialDishItem.toLowerCase()
          );
          if (match) {
            rate = match.price;
          }
        }
      } catch (err) {
        console.error('Settings lookup error in SpecialDish pre-save hook:', err);
      }

      if (rate === 0) {
        const prices = {
          'None': 0,
          'Handvo': 60,
          'Thepla': 40,
          'Tikhi Puri': 40,
          'Aloo Paratha': 50
        };
        rate = prices[this.specialDishItem] || 0;
      }
      this.totalPrice = this.specialDishQty * rate;
      this.hasFreeChaas = false;
    }

    // Cross field geofence match validation
    if (this.city === 'Vallabh Vidyanagar' && this.pincode !== '388120') {
      return next(new Error('Validation failed: Pincode 388120 is required for Vallabh Vidyanagar'));
    }
    if (this.city === 'Karamsad' && this.pincode !== '388325') {
      return next(new Error('Validation failed: Pincode 388325 is required for Karamsad'));
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
