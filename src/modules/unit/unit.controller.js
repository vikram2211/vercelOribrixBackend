import Unit from './unit.model.js';
export const getUnits = async (req, res, next) => {
try {
const units = await Unit.find().sort({ name: 1 });
res.status(200).json({ success: true, data: units });
} catch(err) { next(err); }
};