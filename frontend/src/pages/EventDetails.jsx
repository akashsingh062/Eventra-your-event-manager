import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import dayjs from "dayjs";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaClock, FaCheckCircle, FaUserTie, FaPhoneAlt, FaRupeeSign, FaTicketAlt } from "react-icons/fa";
import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import QRTicket from "../components/student/QRTicket";
import { toast } from "react-toastify";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [showPaymentSim, setShowPaymentSim] = useState(false);
  const [simOrderId, setSimOrderId] = useState("");
  
  // Group booking & coupon states
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const {
    registerForEvent,
    unregisterFromEvent,
    checkRegistration,
    createPaymentOrder,
    verifyPayment,
    handlePaymentFailure,
    validateCoupon,
    getPaymentConfig,
  } = useEvent();
  const { user } = useAuth();
  const [error, setError] = useState("");

  const fetchEvent = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError("Failed to load event details.");
      toast.error(err.response?.data?.message || "Failed to load event details.");
    }
  }, [id]);

  const fetchRegistrationStatus = useCallback(async () => {
    if (!user) return;
    const result = await checkRegistration(id);
    setIsRegistered(result.isRegistered);
    setRegistrationData(result);
  }, [id, user, checkRegistration]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const init = async () => {
      setLoading(true);
      await fetchEvent();
      await fetchRegistrationStatus();
      setLoading(false);
    };
    init();
  }, [fetchEvent, fetchRegistrationStatus]);

  // Compute pricing during render (fixes setState in effect linter error)
  const getPricing = () => {
    if (!event) return { subtotal: 0, discount: 0, finalTotal: 0 };
    const subtotal = event.price * numberOfPeople;
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === "percentage") {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
      } else if (appliedCoupon.discountType === "fixed") {
        discount = appliedCoupon.discountValue;
      }
      discount = Math.min(discount, subtotal);
    }
    return {
      subtotal,
      discount,
      finalTotal: Math.max(0, subtotal - discount),
    };
  };

  const pricing = getPricing();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    const result = await validateCoupon(couponCode, event._id, numberOfPeople);
    if (result && result.valid) {
      setAppliedCoupon(result);
      toast.success("Coupon applied successfully!");
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleFreeRegister = async () => {
    setRegLoading(true);
    const result = await registerForEvent(event._id, numberOfPeople);
    if (result) {
      setIsRegistered(true);
      await fetchEvent();
      await fetchRegistrationStatus();
    }
    setRegLoading(false);
  };

  const handlePaidRegister = async () => {
    setRegLoading(true);

    // Create order first to check if coupon covered full cost (bypass payment)
    const orderData = await createPaymentOrder(
      event._id,
      numberOfPeople,
      appliedCoupon?.couponCode || null
    );

    if (!orderData) {
      setRegLoading(false);
      return;
    }

    // Bypass Razorpay payment if 100% coupon discount made total ₹0
    if (orderData.registrationCompleted) {
      setIsRegistered(true);
      await fetchEvent();
      await fetchRegistrationStatus();
      setShowTicket(true);
      setRegLoading(false);
      return;
    }

    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setRegLoading(false);
      return;
    }

    if (orderData.simulated) {
      setSimOrderId(orderData.orderId);
      setShowPaymentSim(true);
      return;
    }

    // Get dynamic payment config / public key
    const config = await getPaymentConfig();
    if (!config || !config.keyId) {
      toast.error("Failed to load payment gateway configuration from server.");
      setRegLoading(false);
      return;
    }

    // Open Razorpay checkout
    const options = {
      key: config.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Eventra",
      description: `Ticket for ${event.title} (x${numberOfPeople})`,
      order_id: orderData.orderId,
      handler: async function (response) {
        // Verify payment
        const result = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (result) {
          setIsRegistered(true);
          await fetchEvent();
          await fetchRegistrationStatus();
          setShowTicket(true);
        }
        setRegLoading(false);
      },
      modal: {
        ondismiss: async function () {
          // User closed the payment modal
          await handlePaymentFailure(orderData.orderId);
          await fetchEvent();
          setRegLoading(false);
        },
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      theme: {
        color: "#003049",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", async function () {
      await handlePaymentFailure(orderData.orderId);
      await fetchEvent();
      setRegLoading(false);
    });
    rzp.open();
  };

  const handleRegister = () => {
    if (event.isFree) {
      handleFreeRegister();
    } else {
      handlePaidRegister();
    }
  };

  const handleUnregister = async () => {
    setRegLoading(true);
    const success = await unregisterFromEvent(event._id);
    if (success) {
      setIsRegistered(false);
      setRegistrationData(null);
      setShowTicket(false);
      await fetchEvent();
    }
    setRegLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">{error || "Event not found"}</p>
        <Link to="/events" className="text-navy-600 dark:text-steel-500 hover:underline font-medium">
          Back to Events
        </Link>
      </div>
    );
  }

  const isPastEvent = dayjs(event.date).isBefore(dayjs(), "day");
  const isFull = event.availableSeats === 0;

  let statusLabel = "Upcoming";
  if (isPastEvent || event.status === "completed") {
    statusLabel = "Completed";
  } else if (isFull && !isRegistered) {
    statusLabel = "Full";
  }

  const isEventClosed = statusLabel === "Completed";
  const seatPercent = event.totalSeats > 0 ? ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100 : 0;

  // Determine button state
  const isLoggedIn = Boolean(user);
  const isPaidRegistration = registrationData?.paymentStatus === "paid";
  const canRegister = isLoggedIn && statusLabel === "Upcoming" && !isRegistered && !isFull;
  const canUnregister = isLoggedIn && isRegistered && !isEventClosed && !isPaidRegistration;

  return (
    <div className="bg-transparent pb-20">
      {/* Hero Banner */}
      <div className="relative w-full h-[420px] md:h-[520px]">
        <img
          src={event.banner || "https://via.placeholder.com/1200x600"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay using navy tones */}
        <div className="absolute inset-0 bg-linear-to-t from-navy-100 via-navy-200/80 to-transparent"></div>

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-end pb-14">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-steel-700 hover:text-white transition w-max mb-6">
            <FaArrowLeft /> Back to Events
          </Link>

          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${
                statusLabel === "Completed" ? "bg-green-500/20 text-green-300 border-green-500/30" :
                statusLabel === "Full" ? "bg-brick-500/30 text-brick-900 border-brick-500/30" :
                "bg-steel-500/20 text-steel-900 border-steel-500/30"
              }`}>
                {statusLabel === "Completed" ? <FaCheckCircle /> : statusLabel === "Full" ? <FaUsers /> : <FaClock />}
                {statusLabel}
              </span>

              {/* Price badge */}
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${
                event.isFree
                  ? "bg-steel-500/20 text-steel-700 border-steel-500/30"
                  : "bg-cream-300/20 text-cream-300 border-cream-300/30"
              }`}>
                {event.isFree ? (
                  <>
                    <FaTicketAlt />
                    Free
                  </>
                ) : (
                  <>
                    <FaRupeeSign />
                    ₹{event.price}
                  </>
                )}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              {event.title}
            </h1>
            {/* Quick meta pills */}
            <div className="flex flex-wrap gap-4 pt-2">
              <span className="inline-flex items-center gap-2 text-sm text-cream-500 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                <FaCalendarAlt className="text-cream-400" />
                {dayjs(event.date).format("DD MMM YYYY")}
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-cream-500 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                <FaMapMarkerAlt className="text-cream-400" />
                {event.location}
              </span>
              {event.organizerName && (
                <span className="inline-flex items-center gap-2 text-sm text-cream-500 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                  <FaUserTie className="text-cream-400" />
                  {event.organizerName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Left Column - About */}
          <div className="flex-1 space-y-8">
            <div className="bg-white dark:bg-navy-200 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-navy-400/30">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-cream-500 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-brick-500 rounded-full"></span>
                About This Event
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-600 dark:text-steel-700 text-[15px]">
                {event.description}
              </p>
            </div>

            {/* Event Information Card */}
            <div className="bg-white dark:bg-navy-200 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-navy-400/30">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-cream-500 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-navy-500 rounded-full"></span>
                Event Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Organized By</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500">{event.organizerName || "—"}</p>
                </div>
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Contact Info</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500">{event.contactInfo || "—"}</p>
                </div>
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Ticket Price</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500">
                    {event.isFree ? "Free" : `₹${event.price}`}
                  </p>
                </div>
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Total Capacity</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500">{event.totalSeats} seats</p>
                </div>
                <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 dark:text-steel-500 font-medium uppercase tracking-wider mb-1">Event Status</p>
                  <p className="font-semibold text-gray-900 dark:text-cream-500 capitalize">{event.status}</p>
                </div>
              </div>
            </div>

            {/* QR Ticket Section (visible when registered) */}
            {isRegistered && registrationData?.qrPayload && (
              <div className="bg-white dark:bg-navy-200 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-navy-400/30">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-cream-500 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-cream-300 rounded-full"></span>
                  Your Ticket
                </h2>
                <QRTicket
                  event={event}
                  registration={registrationData}
                  qrPayload={registrationData.qrPayload}
                />
              </div>
            )}
          </div>

          {/* Right Column - Registration Card */}
          <div className="w-full lg:w-[400px] lg:sticky lg:top-24">
            <div className="bg-white dark:bg-navy-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-navy-400/30">

              {/* Card Header */}
              <div className={`px-8 py-6 ${isRegistered ? "bg-green-700 dark:bg-green-800" : "bg-navy-500 dark:bg-navy-300"}`}>
                <h3 className="text-xl font-bold text-white">
                  {isRegistered ? "You're Registered! ✓" : "Secure Your Spot"}
                </h3>
                <p className="text-steel-700 text-sm mt-1">
                  {isRegistered ? "You have a confirmed spot for this event" : "Register now before seats run out"}
                </p>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-navy-500/10 dark:bg-navy-400/20 flex items-center justify-center text-navy-600 dark:text-steel-500 shrink-0">
                      <FaCalendarAlt size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Date & Time</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-cream-500 mt-0.5">
                        {dayjs(event.date).format("dddd, MMMM D, YYYY")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-steel-500/10 dark:bg-steel-400/20 flex items-center justify-center text-steel-400 dark:text-steel-500 shrink-0">
                      <FaMapMarkerAlt size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Location</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-cream-500 mt-0.5">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {event.organizerName && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cream-700 dark:bg-cream-100/10 flex items-center justify-center text-cream-200 dark:text-cream-400 shrink-0">
                        <FaUserTie size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Organizer</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-cream-500 mt-0.5">
                          {event.organizerName}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.contactInfo && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-steel-900 dark:bg-steel-300/20 flex items-center justify-center text-steel-400 dark:text-steel-500 shrink-0">
                        <FaPhoneAlt size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Contact</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-cream-500 mt-0.5">
                          {event.contactInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      event.isFree
                        ? "bg-steel-500/10 dark:bg-steel-400/20 text-steel-400 dark:text-steel-500"
                        : "bg-cream-700 dark:bg-cream-100/10 text-cream-200 dark:text-cream-400"
                    }`}>
                      <FaRupeeSign size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Ticket Price</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-cream-500 mt-0.5">
                        {event.isFree ? "Free" : `₹${event.price}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brick-500/10 dark:bg-brick-500/20 flex items-center justify-center text-brick-500 dark:text-brick-700 shrink-0">
                      <FaUsers size={20} />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-500 dark:text-steel-500 font-medium">Availability</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-cream-500">{event.availableSeats} left</p>
                      </div>
                      {/* Seat Progress Bar */}
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-navy-400/30 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            seatPercent > 80 ? "bg-brick-500" : seatPercent > 50 ? "bg-cream-300" : "bg-steel-500"
                          }`}
                          style={{ width: `${seatPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-steel-400 mt-2 text-right">{event.totalSeats} Total Seats</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {canRegister && (
                  <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-navy-400/30">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-steel-600 mb-1.5">
                        Number of Attendees
                      </label>
                      <select
                        value={numberOfPeople}
                        onChange={(e) => setNumberOfPeople(parseInt(e.target.value, 10))}
                        className="w-full bg-cream-900 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/40 rounded-xl px-4 py-3 text-base font-semibold text-gray-900 dark:text-cream-500 focus:outline-hidden focus:ring-2 focus:ring-brick-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num} disabled={num > event.availableSeats}>
                            {num} {num === 1 ? "Person" : "People"} {num > event.availableSeats ? "(N/A)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!event.isFree && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-steel-600 mb-1.5">
                          Have a Coupon?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="ENTER CODE"
                            disabled={!!appliedCoupon}
                            className="flex-1 bg-cream-900 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/40 rounded-xl px-4 py-2.5 text-sm uppercase font-bold tracking-wider text-gray-900 dark:text-cream-500 placeholder-gray-400 disabled:opacity-60 focus:outline-hidden focus:ring-2 focus:ring-brick-500"
                          />
                          {appliedCoupon ? (
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="px-4 py-2.5 bg-brick-500/10 text-brick-500 rounded-xl font-bold text-xs hover:bg-brick-500/20 transition-all"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={couponLoading || !couponCode.trim()}
                              className="px-5 py-2.5 bg-navy-500 text-white rounded-xl font-bold text-xs hover:bg-navy-400 transition-all disabled:opacity-50"
                            >
                              {couponLoading ? "Applying..." : "Apply"}
                            </button>
                          )}
                        </div>
                        {appliedCoupon && (
                          <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                            ✓ Code applied! {appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`} off.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pricing breakdown summary */}
                    <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-4.5 space-y-2.5 text-sm border border-gray-100 dark:border-navy-400/20">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-steel-500">Ticket Price:</span>
                        <span className="font-semibold text-gray-900 dark:text-cream-500">
                          {event.isFree ? "Free" : `₹${event.price} × ${numberOfPeople}`}
                        </span>
                      </div>
                      {!event.isFree && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-steel-500">Subtotal:</span>
                            <span className="font-semibold text-gray-900 dark:text-cream-500">₹{pricing.subtotal}</span>
                          </div>
                          {pricing.discount > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                              <span>Discount:</span>
                              <span>-₹{pricing.discount}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-navy-400/30 font-bold text-[15px] text-gray-900 dark:text-cream-500">
                            <span>Total Amount:</span>
                            <span>₹{pricing.finalTotal}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-6 space-y-3">
                  {!isLoggedIn ? (
                    <>
                      <Link
                        to="/login"
                        className="block w-full py-4 rounded-2xl font-bold text-lg text-center bg-brick-500 text-white hover:bg-brick-400 shadow-lg shadow-brick-500/25 dark:shadow-none hover:shadow-xl transition-all"
                      >
                        Login to Register
                      </Link>
                      <p className="text-center text-xs text-gray-500 dark:text-steel-400">
                        You need an account to register for events.
                      </p>
                    </>
                  ) : canUnregister ? (
                    <>
                      <button
                        disabled={regLoading}
                        onClick={handleUnregister}
                        className="w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 bg-red-50 dark:bg-brick-500/10 text-brick-500 dark:text-brick-700 border-2 border-brick-500/30 hover:bg-brick-500/10 dark:hover:bg-brick-500/20 disabled:opacity-60"
                      >
                        {regLoading ? "Processing..." : "Unregister from Event"}
                      </button>
                      <p className="text-center text-xs text-gray-500 dark:text-steel-400">
                        You can cancel your registration anytime before the event.
                      </p>
                    </>
                  ) : isRegistered && isPaidRegistration ? (
                    <>
                      <button
                        onClick={() => setShowTicket(!showTicket)}
                        className="w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-500/30 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <FaTicketAlt className="inline mr-2" />
                        {showTicket ? "Hide Ticket" : "View Ticket"}
                      </button>
                      <p className="text-center text-xs text-gray-500 dark:text-steel-400">
                        Payment confirmed. Non-refundable ticket.
                      </p>
                    </>
                  ) : canRegister ? (
                    <>
                      <button
                        disabled={regLoading}
                        onClick={handleRegister}
                        className="w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 bg-brick-500 text-white hover:bg-brick-400 shadow-lg shadow-brick-500/25 dark:shadow-none hover:shadow-xl disabled:opacity-60"
                      >
                        {regLoading
                          ? "Processing..."
                          : event.isFree
                          ? `Register ${numberOfPeople} ${numberOfPeople === 1 ? "Person" : "People"}`
                          : pricing.finalTotal === 0
                          ? "Complete Free Checkout"
                          : `Pay ₹${pricing.finalTotal} & Register`}
                      </button>
                      <p className="text-center text-xs text-gray-500 dark:text-steel-400">
                        {event.isFree
                          ? "By registering, you agree to the campus event policies."
                          : pricing.finalTotal === 0
                          ? "100% discount applied. Verify and complete checkout immediately."
                          : "You'll be redirected to Razorpay for secure payment."}
                      </p>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 rounded-2xl font-bold text-lg bg-gray-100 dark:bg-navy-400/30 text-gray-400 dark:text-steel-400 cursor-not-allowed shadow-none"
                    >
                      {isEventClosed ? "Event Completed" : isFull ? "No Seats Available" : "Registration Closed"}
                    </button>
                  )}
                </div>

                {/* Inline ticket view for paid events */}
                {showTicket && isRegistered && registrationData?.qrPayload && (
                  <div className="pt-4">
                    <QRTicket
                      event={event}
                      registration={registrationData}
                      qrPayload={registrationData.qrPayload}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Payment Simulator Modal */}
      {showPaymentSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-navy-200 rounded-3xl p-8 max-w-md w-full border border-gray-100 dark:border-navy-400/30 shadow-2xl space-y-6 zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-cream-300/20 text-cream-300 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                💳
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-cream-500">
                Payment Simulator
              </h3>
              <p className="text-sm text-gray-500 dark:text-steel-500">
                Razorpay API credentials are not configured or invalid on the server. The application has entered simulated payment mode.
              </p>
            </div>
            
            <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5 space-y-2.5 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Order ID:</span>
                <span className="font-semibold text-gray-900 dark:text-cream-500">{simOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Tickets:</span>
                <span className="font-semibold text-gray-900 dark:text-cream-500">
                  {numberOfPeople} {numberOfPeople === 1 ? "seat" : "seats"}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="font-medium">Coupon Applied:</span>
                  <span className="font-semibold">{appliedCoupon.couponCode} (-₹{pricing.discount})</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 dark:border-navy-400/30 pt-2 text-base font-bold">
                <span className="text-gray-400">Total Payable:</span>
                <span className="text-gray-900 dark:text-cream-500">₹{pricing.finalTotal}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  setShowPaymentSim(false);
                  const result = await verifyPayment({
                    razorpay_order_id: simOrderId,
                    razorpay_payment_id: `mock_pay_${Date.now()}`,
                    razorpay_signature: "mock_signature",
                  });
                  if (result) {
                    setIsRegistered(true);
                    await fetchEvent();
                    await fetchRegistrationStatus();
                    setShowTicket(true);
                  }
                  setRegLoading(false);
                }}
                className="w-full py-3.5 rounded-2xl font-bold text-base text-center bg-green-600 text-white hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 active:scale-[0.98]"
              >
                Simulate Success Payment
              </button>
              <button
                onClick={async () => {
                  setShowPaymentSim(false);
                  await handlePaymentFailure(simOrderId);
                  await fetchEvent();
                  setRegLoading(false);
                }}
                className="w-full py-3.5 rounded-2xl font-bold text-base text-center bg-brick-500 text-white hover:bg-brick-400 transition-all shadow-lg shadow-brick-500/20 active:scale-[0.98]"
              >
                Simulate Cancel / Failure
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventDetails;
