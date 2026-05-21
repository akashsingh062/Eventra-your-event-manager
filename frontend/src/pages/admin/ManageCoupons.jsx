import { useEffect, useState, useCallback } from "react";
import { useEvent } from "../../context/EventContext";
import { FaTicketAlt, FaPlus, FaTrash, FaCheck, FaTimes, FaToggleOn, FaToggleOff, FaCalendarAlt, FaSearch } from "react-icons/fa";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const ManageCoupons = () => {
  const {
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    events,
    fetchEvents,
  } = useEvent();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [applicableEvent, setApplicableEvent] = useState("all");

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const data = await fetchCoupons();
    setCoupons(data || []);
    setLoading(false);
  }, [fetchCoupons]);

  useEffect(() => {
    loadCoupons();
    fetchEvents();
  }, [loadCoupons, fetchEvents]);

  const handleOpenModal = () => {
    setCouponCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setExpirationDate(dayjs().add(7, "day").format("YYYY-MM-DD"));
    setUsageLimit("");
    setApplicableEvent("all");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.warn("Coupon code is required");
      return;
    }
    if (!discountValue || isNaN(discountValue) || Number(discountValue) <= 0) {
      toast.warn("Discount value must be a positive number");
      return;
    }
    if (discountType === "percentage" && Number(discountValue) > 100) {
      toast.warn("Percentage discount cannot exceed 100%");
      return;
    }

    const payload = {
      code: couponCode.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      expiresAt: expirationDate ? new Date(expirationDate) : undefined,
      maxUses: usageLimit ? Number(usageLimit) : undefined,
      applicableEvents: applicableEvent === "all" ? [] : [applicableEvent],
    };

    setSubmitLoading(true);
    try {
      const success = await createCoupon(payload);
      if (success) {
        setShowModal(false);
        loadCoupons();
      }
    } catch {
      // Error handled inside Context
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const success = await updateCoupon(id, { isActive: !currentStatus });
      if (success) {
        loadCoupons();
      }
    } catch {
      // Error handled inside Context
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;
    try {
      const success = await deleteCoupon(id);
      if (success) {
        loadCoupons();
      }
    } catch {
      // Error handled inside Context
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const q = searchQuery.toLowerCase();
    return coupon.code?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 bg-transparent">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Coupons
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and monitor discount coupons for paid events
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brick-500 text-white rounded-xl font-bold text-sm hover:bg-brick-400 shadow-lg shadow-brick-500/25 dark:shadow-none hover:shadow-xl transition-all"
        >
          <FaPlus size={14} /> Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Search coupon code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 text-gray-900 dark:text-cream-500 placeholder-gray-400 dark:placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition-all text-sm"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-steel-800 border-t-navy-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl py-24 shadow-sm max-w-2xl mx-auto">
          <div className="text-steel-700 dark:text-steel-300 mb-6 flex justify-center">
            <FaTicketAlt className="w-14 h-14 text-steel-500/60" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {searchQuery ? "No Matches Found" : "No Coupons Available"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery
              ? `No coupons match "${searchQuery}".`
              : "Generate discount coupons to boost registrations for your paid events."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                  Coupon Code
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                  Discount Value
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                  Applicability
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                  Usage Limit
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCoupons.map((coupon) => {
                const isExpired = coupon.expiresAt && dayjs(coupon.expiresAt).isBefore(dayjs(), "day");
                const isLimitReached = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                const statusBadge = isExpired ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    Expired
                  </span>
                ) : isLimitReached ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    Limit Reached
                  </span>
                ) : coupon.isActive ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Inactive
                  </span>
                );

                return (
                  <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaTicketAlt className="text-gray-400 dark:text-gray-500 text-sm" />
                        <span className="font-mono font-bold text-gray-900 dark:text-white uppercase text-[15px]">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-cream-500 text-sm">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% Off`
                          : `₹${coupon.discountValue} Off`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.applicableEvents && coupon.applicableEvents.length > 0 ? (
                        <span className="inline-flex flex-col gap-1 max-w-[180px]">
                          {coupon.applicableEvents.map((eventId) => {
                            const eventObj = events.find(
                              (e) => e._id.toString() === eventId.toString()
                            );
                            return (
                              <span
                                key={eventId}
                                className="font-semibold text-xs bg-navy-500/10 dark:bg-navy-500/20 text-navy-600 dark:text-cream-500 px-2.5 py-1 rounded-lg truncate"
                                title={eventObj ? eventObj.title : "Event Specific"}
                              >
                                {eventObj ? eventObj.title : "Event Specific"}
                              </span>
                            );
                          })}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Global (All Events)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-cream-500 text-sm">
                        {coupon.usedCount} used
                      </div>
                      {coupon.maxUses && (
                        <div className="text-[11px] text-gray-500 dark:text-steel-500 mt-0.5">
                          Limit: {coupon.maxUses}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {coupon.expiresAt
                        ? dayjs(coupon.expiresAt).format("DD MMM YYYY")
                        : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                          disabled={isExpired}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                          className={`text-lg transition-colors ${
                            isExpired
                              ? "opacity-30 cursor-not-allowed text-gray-400"
                              : coupon.isActive
                              ? "text-emerald-500 hover:text-emerald-600"
                              : "text-gray-400 hover:text-gray-500"
                          }`}
                        >
                          {coupon.isActive ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-navy-200 border border-gray-100 dark:border-navy-400/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-navy-400/20 flex justify-between items-center bg-gray-50 dark:bg-navy-300/30">
              <h3 className="font-bold text-gray-900 dark:text-cream-500 text-lg flex items-center gap-2">
                <FaTicketAlt className="text-brick-500" /> Create Discount Coupon
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-cream-500 text-lg transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Coupon Code */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-steel-600 uppercase tracking-wider mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLAT100, SUMMER50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/30 rounded-xl px-4 py-3 font-mono font-bold tracking-wider text-gray-900 dark:text-cream-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brick-500 uppercase"
                  required
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-steel-600 uppercase tracking-wider mb-2">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/30 rounded-xl px-4 py-3 font-semibold text-gray-900 dark:text-cream-500 focus:outline-none focus:ring-2 focus:ring-brick-500"
                  >
                    <option value="percentage" className="bg-white dark:bg-navy-200 text-gray-900 dark:text-cream-500">Percentage (%)</option>
                    <option value="fixed" className="bg-white dark:bg-navy-200 text-gray-900 dark:text-cream-500">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-steel-600 uppercase tracking-wider mb-2">
                    Discount Value {discountType === "percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === "percentage" ? "100" : "10000"}
                    placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 150"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/30 rounded-xl px-4 py-3 font-semibold text-gray-900 dark:text-cream-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brick-500"
                    required
                  />
                </div>
              </div>



              {/* Applicable Event Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-steel-600 uppercase tracking-wider mb-2">
                  Applicable Event
                </label>
                <select
                  value={applicableEvent}
                  onChange={(e) => setApplicableEvent(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/30 rounded-xl px-4 py-3 font-semibold text-gray-900 dark:text-cream-500 focus:outline-none focus:ring-2 focus:ring-brick-500"
                >
                  <option value="all" className="bg-white dark:bg-navy-200 text-gray-900 dark:text-cream-500">All Events (Global)</option>
                  {events
                    .filter((event) => !event.isFree)
                    .map((event) => (
                      <option key={event._id} value={event._id} className="bg-white dark:bg-navy-200 text-gray-900 dark:text-cream-500">
                        {event.title} (₹{event.price})
                      </option>
                    ))}
                </select>
              </div>

              {/* Limit & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-steel-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FaCalendarAlt className="text-gray-400" /> Expiry Date
                  </label>
                  <input
                    type="date"
                    min={dayjs().format("YYYY-MM-DD")}
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/30 rounded-xl px-4 py-3 font-semibold text-gray-900 dark:text-cream-500 focus:outline-none focus:ring-2 focus:ring-brick-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-steel-600 uppercase tracking-wider mb-2">
                    Usage Limit (Times)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-navy-300 border border-gray-200 dark:border-navy-400/30 rounded-xl px-4 py-3 font-semibold text-gray-900 dark:text-cream-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brick-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-navy-400/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-50 dark:bg-navy-300/30 hover:bg-gray-100 text-gray-700 dark:text-cream-500 font-bold rounded-xl text-sm border border-gray-200 dark:border-navy-400/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 bg-brick-500 hover:bg-brick-400 text-white font-bold rounded-xl text-sm shadow-md shadow-brick-500/25 dark:shadow-none hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Coupon"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
