import mongoose from 'mongoose';

const waiterSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    identificationNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phoneNumber: { 
        type: String, 
        required: true 
    },
    userName: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

export const WaiterModel = mongoose.model('Waiter', waiterSchema); 