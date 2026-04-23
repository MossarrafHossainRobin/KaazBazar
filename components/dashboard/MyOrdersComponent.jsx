"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Clock, CheckCircle, XCircle, Eye, 
  Search, RefreshCw, ChevronRight, ThumbsUp, Check,
  Calendar, MapPin, MessageCircle, Phone, AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, updateDoc, doc, orderBy, addDoc, serverTimestamp, getDoc, runTransaction } from "firebase/firestore";
import { 
  sendOrderConfirmedNotification, 
  sendOrderCompletedNotification, 
  sendOrderCancelledNotification,
  sendBrowserNotification,
  createNotification
} from "@/lib/notificationService";

export default function MyOrdersComponent() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchCalledRef = useRef(false);
  const actionInProgressRef = useRef({});

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef, 
        where("customerId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please refresh.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && !fetchCalledRef.current) {
      fetchCalledRef.current = true;
      fetchOrders();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        if (!loading) {
          fetchOrders();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchOrders, loading]);

  const refreshOrders = async () => {
    if (loading) return;
    setLoading(true);
    await fetchOrders();
  };

  // Send confirmation message and update order - FIXED
  const sendInitialMessage = async (order) => {
    // Prevent multiple confirmations
    const actionKey = `confirm_${order.id}`;
    if (actionInProgressRef.current[actionKey]) {
      console.log("Confirmation already in progress");
      return;
    }
    
    if (updating || confirmingOrder) return;
    
    // Check if order is already confirmed
    if (order.status === "confirmed") {
      alert("This order is already confirmed");
      return;
    }
    
    if (order.status !== "pending") {
      alert(`Cannot confirm order with status: ${order.status}`);
      return;
    }
    
    actionInProgressRef.current[actionKey] = true;
    setConfirmingOrder(order.id);
    setUpdating(true);
    
    try {
      const conversationId = `${currentUser.uid}_${order.providerId}`;
      const initialMessage = `Hi ${order.providerName}, I have confirmed my service request for ${order.serviceName} on ${order.scheduledDate} at ${order.scheduledTime}. Looking forward to your service. Please let me know if you need any additional information.`;
      
      // Use transaction to prevent race conditions
      const orderRef = doc(db, "orders", order.id);
      
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw new Error("Order does not exist");
        }
        
        const currentOrder = orderDoc.data();
        if (currentOrder.status !== "pending") {
          throw new Error(`Order status is ${currentOrder.status}, cannot confirm`);
        }
        
        // Update order status
        transaction.update(orderRef, {
          status: "confirmed",
          confirmedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      // Create or update conversation
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (!conversationSnap.exists()) {
        await updateDoc(conversationRef, {
          participants: [currentUser.uid, order.providerId],
          participantNames: {
            [currentUser.uid]: currentUser.name,
            [order.providerId]: order.providerName
          },
          lastMessage: initialMessage,
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      } else {
        await updateDoc(conversationRef, {
          lastMessage: initialMessage,
          lastMessageTime: serverTimestamp()
        });
      }
      
      // Add message
      await addDoc(collection(db, "messages"), {
        conversationId: conversationId,
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderType: "customer",
        recipientId: order.providerId,
        recipientType: "provider",
        message: initialMessage,
        type: "order_confirmation",
        orderId: order.orderId,
        read: false,
        createdAt: serverTimestamp()
      });
      
      // Send notification only once
      await sendOrderConfirmedNotification({
        customerId: currentUser.uid,
        customerName: currentUser.name,
        providerId: order.providerId,
        providerName: order.providerName,
        serviceName: order.serviceName,
        orderId: order.orderId,
        scheduledDate: order.scheduledDate,
        scheduledTime: order.scheduledTime
      });
      
      await fetchOrders();
      
      // Redirect to message page
      router.push(`/messages/${conversationId}?orderId=${order.orderId}&providerId=${order.providerId}&providerName=${order.providerName}`);
      
    } catch (error) {
      console.error("Error confirming order:", error);
      alert(error.message || "Failed to confirm. Please try again.");
    } finally {
      setUpdating(false);
      setConfirmingOrder(null);
      delete actionInProgressRef.current[actionKey];
    }
  };

  // Handle order completion confirmation - FIXED
  const handleConfirmCompletion = async (order) => {
    const actionKey = `complete_${order.id}`;
    if (actionInProgressRef.current[actionKey]) {
      console.log("Completion already in progress");
      return;
    }
    
    if (updating || confirmingOrder) return;
    
    if (order.status === "completed") {
      alert("This order is already completed");
      return;
    }
    
    if (order.status !== "confirmed") {
      alert(`Cannot complete order with status: ${order.status}`);
      return;
    }
    
    actionInProgressRef.current[actionKey] = true;
    setConfirmingOrder(order.id);
    setUpdating(true);
    
    try {
      const orderRef = doc(db, "orders", order.id);
      
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw new Error("Order does not exist");
        }
        
        const currentOrder = orderDoc.data();
        if (currentOrder.status !== "confirmed") {
          throw new Error(`Order status is ${currentOrder.status}, cannot complete`);
        }
        
        transaction.update(orderRef, {
          status: "completed",
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      // Send completion message
      const conversationId = `${currentUser.uid}_${order.providerId}`;
      const completionMessage = `✅ Service completed successfully! Thank you for your service.`;
      
      await addDoc(collection(db, "messages"), {
        conversationId: conversationId,
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderType: "customer",
        recipientId: order.providerId,
        recipientType: "provider",
        message: completionMessage,
        type: "completion_confirmation",
        orderId: order.orderId,
        read: false,
        createdAt: serverTimestamp()
      });
      
      // Send notification only once
      await sendOrderCompletedNotification({
        customerId: currentUser.uid,
        customerName: currentUser.name,
        providerId: order.providerId,
        providerName: order.providerName,
        serviceName: order.serviceName,
        orderId: order.orderId
      });
      
      await fetchOrders();
      alert("Service marked as completed! Thank you for using Kaazbazar.");
      
      // Redirect to message page with rating option
      router.push(`/messages/${conversationId}?orderId=${order.orderId}&providerId=${order.providerId}&providerName=${order.providerName}&completed=true`);
      
    } catch (error) {
      console.error("Error confirming completion:", error);
      alert(error.message || "Failed to confirm completion. Please try again.");
    } finally {
      setUpdating(false);
      setConfirmingOrder(null);
      delete actionInProgressRef.current[actionKey];
    }
  };

  // Handle order cancellation - FIXED
  const handleCancelOrder = async (order) => {
    const actionKey = `cancel_${order.id}`;
    if (actionInProgressRef.current[actionKey]) {
      console.log("Cancellation already in progress");
      return;
    }
    
    if (updating || cancellingOrder) return;
    
    if (order.status === "cancelled") {
      alert("This order is already cancelled");
      return;
    }
    
    if (order.status !== "pending") {
      alert(`Cannot cancel order with status: ${order.status}`);
      return;
    }
    
    const confirmCancel = confirm("Are you sure you want to cancel this service request?");
    if (!confirmCancel) return;
    
    actionInProgressRef.current[actionKey] = true;
    setCancellingOrder(order.id);
    setUpdating(true);
    
    try {
      const orderRef = doc(db, "orders", order.id);
      
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw new Error("Order does not exist");
        }
        
        const currentOrder = orderDoc.data();
        if (currentOrder.status !== "pending") {
          throw new Error(`Order status is ${currentOrder.status}, cannot cancel`);
        }
        
        transaction.update(orderRef, {
          status: "cancelled",
          cancelledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          cancelledBy: "customer"
        });
      });
      
      // Send cancellation message to conversation
      const conversationId = `${currentUser.uid}_${order.providerId}`;
      await addDoc(collection(db, "messages"), {
        conversationId: conversationId,
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderType: "customer",
        recipientId: order.providerId,
        recipientType: "provider",
        message: `❌ Service request cancelled. I no longer need this service. Order #${order.orderId?.slice(-8)}`,
        type: "order_cancelled",
        orderId: order.orderId,
        read: false,
        createdAt: serverTimestamp()
      });
      
      // Send notification only once
      await sendOrderCancelledNotification({
        customerId: currentUser.uid,
        customerName: currentUser.name,
        providerId: order.providerId,
        providerName: order.providerName,
        serviceName: order.serviceName,
        orderId: order.orderId,
        cancelledBy: "customer"
      });
      
      await fetchOrders();
      alert("Service request cancelled successfully");
      
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Failed to cancel order. Please try again.");
    } finally {
      setUpdating(false);
      setCancellingOrder(null);
      delete actionInProgressRef.current[actionKey];
    }
  };

  const getStatusBadge = (status, expiresAt) => {
    const isExpired = expiresAt?.toDate && expiresAt.toDate() < new Date();
    
    if (status === "pending" && isExpired) {
      return { bg: "bg-red-100", text: "text-red-600", icon: AlertCircle, label: "Expired", border: "border-red-200" };
    }
    
    switch(status) {
      case "completed": 
        return { bg: "bg-green-100", text: "text-green-600", icon: CheckCircle, label: "Completed", border: "border-green-200" };
      case "confirmed": 
        return { bg: "bg-blue-100", text: "text-blue-600", icon: CheckCircle, label: "Confirmed", border: "border-blue-200" };
      case "pending": 
        return { bg: "bg-yellow-100", text: "text-yellow-600", icon: Clock, label: "Pending", border: "border-yellow-200" };
      case "cancelled": 
        return { bg: "bg-red-100", text: "text-red-600", icon: XCircle, label: "Cancelled", border: "border-red-200" };
      default: 
        return { bg: "bg-gray-100", text: "text-gray-600", icon: Package, label: status, border: "border-gray-200" };
    }
  };

  const tabs = [
    { id: "all", label: "All", count: orders.length },
    { id: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
    { id: "confirmed", label: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
    { id: "completed", label: "Completed", count: orders.filter(o => o.status === "completed").length },
    { id: "cancelled", label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch = order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.providerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Show loading only on initial load
  if (initialLoad && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={refreshOrders}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">My Service Requests</h1>
              <p className="text-gray-500 text-sm">Track and manage your requests</p>
            </div>
            <button
              onClick={refreshOrders}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id 
                  ? "text-green-600 border-b-2 border-green-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-800">No orders found</h3>
              <p className="text-gray-400 text-sm mt-1">You haven't placed any orders yet</p>
              <button 
                onClick={() => router.push("/")}
                className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                Browse Services
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = getStatusBadge(order.status, order.expiresAt);
              const StatusIcon = status.icon;
              const isConfirming = confirmingOrder === order.id;
              const isCancelling = cancellingOrder === order.id;
              
              return (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-gray-400 font-mono">#{order.orderId?.slice(-10)}</p>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg} ${status.border} border`}>
                          <StatusIcon className={`w-3 h-3 ${status.text}`} />
                          <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 mt-1">{order.serviceName}</h3>
                      <p className="text-sm text-gray-500">{order.providerName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {order.scheduledTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium px-3 py-1 rounded-lg hover:bg-green-50 transition"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Details
                      </button>
                      
                      {order.status === "pending" && (
                        <>
                          <button 
                            onClick={() => sendInitialMessage(order)}
                            disabled={isConfirming || isCancelling || updating}
                            className="text-sm bg-green-600 text-white font-medium px-3 py-1 rounded-lg hover:bg-green-700 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isConfirming ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ThumbsUp className="w-3 h-3" />
                            )}
                            Confirm
                          </button>
                          <button 
                            onClick={() => handleCancelOrder(order)}
                            disabled={isConfirming || isCancelling || updating}
                            className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isCancelling ? (
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {order.status === "confirmed" && (
                        <button 
                          onClick={() => handleConfirmCompletion(order)}
                          disabled={isConfirming || updating}
                          className="text-sm bg-blue-600 text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {isConfirming ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Complete
                        </button>
                      )}
                      
                      {order.status !== "pending" && order.status !== "cancelled" && (
                        <button 
                          onClick={() => {
                            const conversationId = `${currentUser.uid}_${order.providerId}`;
                            router.push(`/messages/${conversationId}?orderId=${order.orderId}&providerId=${order.providerId}&providerName=${order.providerName}`);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-50 transition"
                        >
                          <MessageCircle className="w-4 h-4 inline mr-1" />
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-sm text-gray-500 font-mono">{selectedOrder.orderId}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Service Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Service</p>
                  <p className="font-semibold text-gray-800 mt-1">{selectedOrder.serviceName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Provider</p>
                  <p className="font-semibold text-gray-800 mt-1">{selectedOrder.providerName}</p>
                  {selectedOrder.providerPhone && (
                    <p className="text-xs text-gray-500">{selectedOrder.providerPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Date & Time</p>
                  <p className="font-medium text-gray-700 mt-1">{selectedOrder.scheduledDate} at {selectedOrder.scheduledTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Payment Method</p>
                  <p className="font-medium text-gray-700 mt-1 capitalize">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
              
              {/* Work Description */}
              {selectedOrder.workDescription && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Work Description</p>
                  <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">{selectedOrder.workDescription}</p>
                </div>
              )}
              
              {/* Address */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Service Address</p>
                <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">{selectedOrder.address}</p>
              </div>
              
              {/* Instructions */}
              {selectedOrder.instructions && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Special Instructions</p>
                  <p className="text-gray-700 mt-1 bg-yellow-50 p-3 rounded-lg">{selectedOrder.instructions}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              {selectedOrder.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      sendInitialMessage(selectedOrder);
                      setShowModal(false);
                    }}
                    disabled={confirmingOrder === selectedOrder.id || cancellingOrder === selectedOrder.id || updating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Confirm Order
                  </button>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder);
                      setShowModal(false);
                    }}
                    disabled={updating || cancellingOrder === selectedOrder.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {cancellingOrder === selectedOrder.id ? "Cancelling..." : "Cancel Order"}
                  </button>
                </>
              )}
              {selectedOrder.status === "confirmed" && (
                <button
                  onClick={() => {
                    handleConfirmCompletion(selectedOrder);
                    setShowModal(false);
                  }}
                  disabled={updating || confirmingOrder === selectedOrder.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}