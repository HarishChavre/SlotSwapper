import Event from "../models/Event.js";
import SwapRequest from "../models/SwapRequest.js";

export const getSwappableSlots = async (req, res) => {
  const slots = await Event.find({ status: "SWAPPABLE", user: { $ne: req.user._id } }).populate("user", "name email");
  res.json(slots);
};

export const createSwapRequest = async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  const mySlot = await Event.findOne({ _id: mySlotId, user: req.user._id });
  const theirSlot = await Event.findById(theirSlotId);
  if (!mySlot || !theirSlot || mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE")
    return res.status(400).json({ message: "Invalid slots" });
  const swap = await SwapRequest.create({
    requester: req.user._id,
    receiver: theirSlot.user,
    mySlot: mySlotId,
    theirSlot: theirSlotId
  });
  await Event.updateMany({ _id: { $in: [mySlotId, theirSlotId] } }, { status: "SWAP_PENDING" });
  res.status(201).json(swap);
};

export const respondToSwap = async (req, res) => {
  const { requestId } = req.params;
  const { accept } = req.body;
  const request = await SwapRequest.findById(requestId).populate("mySlot theirSlot");
  if (!request || String(request.receiver) !== String(req.user._id))
    return res.status(403).json({ message: "Unauthorized" });
  if (!accept) {
    request.status = "REJECTED";
    await request.save();
    await Event.updateMany({ _id: { $in: [request.mySlot._id, request.theirSlot._id] } }, { status: "SWAPPABLE" });
    return res.json(request);
  }
  request.status = "ACCEPTED";
  const myOwner = request.mySlot.user;
  const theirOwner = request.theirSlot.user;
  await Event.findByIdAndUpdate(request.mySlot._id, { user: theirOwner, status: "BUSY" });
  await Event.findByIdAndUpdate(request.theirSlot._id, { user: myOwner, status: "BUSY" });
  await request.save();
  res.json(request);
};

export const getSwapRequests = async (req, res) => {
  const incoming = await SwapRequest.find({ receiver: req.user._id })
    .populate("mySlot theirSlot requester", "name email");
  const outgoing = await SwapRequest.find({ requester: req.user._id })
    .populate("mySlot theirSlot receiver", "name email");
  res.json({ incoming, outgoing });
};
