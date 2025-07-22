// components/NotificationDialog.tsx

import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/ChatContext";

export const NotificationDialog = () => {
  const { state, respondToRequest, dismissNotificationDialog } = useChat();
  const request = state.pendingRequest;

  if (!request) return null;

  const handleResponse = async (isRequestAccepted: boolean) => {
    await respondToRequest(request.id, isRequestAccepted);
    dismissNotificationDialog();
  };

  return (
    <Dialog open={state.showNotificationDialog} onOpenChange={dismissNotificationDialog}>
      <DialogContent>
        <DialogHeader>
          {request.senderName} wants to {request.requestType === 'CALL' ? 'call' : 'chat'} with you
        </DialogHeader>
        <p className="text-sm text-gray-500">Product: {request.productName}</p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleResponse(false)}>Reject</Button>
          <Button onClick={() => handleResponse(true)}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};