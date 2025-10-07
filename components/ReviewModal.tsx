import { saveEngagementApi } from "@/api/eventsave";
import { useMyReview, useSubmitRating, useUpsertReviewText } from "@/hooks/useReviews";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  eventId: string;
  eventDateISO: string;
  eventTime?: string;
  isAuthenticated: boolean;
  isEngaged: boolean;
  onEngaged?: () => void;
};

export default function ReviewModal({
  visible,
  onClose,
  eventId,
  eventDateISO,
  eventTime,
  isAuthenticated,
  isEngaged,
  onEngaged,
}: Props) {
  const { data: myReview, isLoading: loadingMy } = useMyReview(eventId);
  const submit = useSubmitRating(eventId);
  const upsert = useUpsertReviewText(eventId);

  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState<string>("");

  const eventDateTimePassed = useMemo(() => {
    const [hh, mm] = (eventTime || "00:00").split(":").map(Number);
    const dt = new Date(eventDateISO);
    dt.setHours(hh || 0, mm || 0, 0, 0);
    return Date.now() > dt.getTime();
  }, [eventDateISO, eventTime]);

  const canRate = isAuthenticated && isEngaged && eventDateTimePassed && !myReview;
  const canEditText = isAuthenticated && myReview != null;

  const [error, setError] = useState<string | null>(null);
  const [engaging, setEngaging] = useState(false);

  const handleEngage = async () => {
    if (!isAuthenticated) {
      setError("Please sign in to engage and rate.");
      return;
    }
    try {
      setError(null);
      setEngaging(true);
      await saveEngagementApi(eventId);
      onEngaged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not engage with event.");
    } finally {
      setEngaging(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (!canRate) return;
      if (rating < 1 || rating > 5) {
        setError("Rating must be between 1 and 5.");
        return;
      }
      if (text.length > 200) {
        setError("Review text must be 200 characters or less.");
        return;
      }
      await submit.mutateAsync({ rating, text: text || undefined });
      onClose();
    } catch (e: any) {
      const code = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (code === 400
          ? "Too early to rate."
          : code === 403
          ? "Only engaged users can rate this event."
          : code === 409
          ? "You have already rated this event."
          : "Something went wrong.");
      setError(msg);
    }
  };

  const handleSaveText = async () => {
    setError(null);
    try {
      if (!canEditText) return;
      if (text.length > 200) {
        setError("Review text must be 200 characters or less.");
        return;
      }
      await upsert.mutateAsync({ text: text || undefined });
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Could not update review text.";
      setError(msg);
    }
  };

  useEffect(() => {
    if (myReview?.text) setText(myReview.text);
    else setText("");
  }, [myReview]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{myReview ? "Your Review" : "Rate this event"}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 16, color: "#007aff" }}>Close</Text></TouchableOpacity>
          </View>

          {loadingMy ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              {!eventDateTimePassed && (
                <Text style={{ marginTop: 12, color: "#555" }}>Rating will open after the event time has passed.</Text>
              )}

              {!isEngaged && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ marginBottom: 8 }}>You need to engage (RSVP/save) before rating.</Text>
                  <TouchableOpacity
                    onPress={handleEngage}
                    disabled={engaging}
                    style={{ backgroundColor: "#007aff", padding: 12, borderRadius: 8 }}
                  >
                    {engaging ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", textAlign: "center" }}>Engage</Text>}
                  </TouchableOpacity>
                </View>
              )}

              {myReview ? (
                <>
                  <Text style={{ marginTop: 16, fontWeight: "500" }}>Your rating: {myReview.rating}★</Text>
                  <TextInput
                    placeholder="Write or update your review (optional, max 200 chars)"
                    value={text}
                    onChangeText={setText}
                    maxLength={200}
                    multiline
                    style={{
                      marginTop: 12,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      padding: 10,
                      minHeight: 96,
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleSaveText}
                    disabled={upsert.isPending}
                    style={{ backgroundColor: "#00c853", padding: 12, borderRadius: 8, marginTop: 12 }}
                  >
                    {upsert.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", textAlign: "center" }}>Save</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={{ marginTop: 16, fontWeight: "500" }}>Your rating</Text>
                  <View style={{ flexDirection: "row", marginTop: 8 }}>
                    {[1,2,3,4,5].map((n) => (
                      <TouchableOpacity key={n} onPress={() => setRating(n)} style={{ padding: 6 }}>
                        <Text style={{ fontSize: 28, color: n <= rating ? "#FFD700" : "#ccc" }}>★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    placeholder="Write a short review (optional, max 200 chars)"
                    value={text}
                    onChangeText={setText}
                    maxLength={200}
                    multiline
                    style={{
                      marginTop: 12,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      padding: 10,
                      minHeight: 96,
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!canRate || submit.isPending}
                    style={{ backgroundColor: canRate ? "#007aff" : "#9bbcf7", padding: 12, borderRadius: 8, marginTop: 12 }}
                  >
                    {submit.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", textAlign: "center" }}>Submit</Text>}
                  </TouchableOpacity>
                </>
              )}

              {error ? <Text style={{ marginTop: 10, color: "#d32f2f" }}>{error}</Text> : null}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}


