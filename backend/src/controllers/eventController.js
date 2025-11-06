import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
  const { title, startTime, endTime } = req.body;
  const event = await Event.create({ title, startTime, endTime, user: req.user._id });
  res.status(201).json(event);
};

export const getMyEvents = async (req, res) => {
  const events = await Event.find({ user: req.user._id });
  res.json(events);
};

export const updateEventStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const event = await Event.findOneAndUpdate({ _id: id, user: req.user._id }, { status }, { new: true });
  res.json(event);
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  await Event.findOneAndDelete({ _id: id, user: req.user._id });
  res.json({ message: "Deleted" });
};
