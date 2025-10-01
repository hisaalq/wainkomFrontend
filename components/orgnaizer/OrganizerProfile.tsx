import { getOrgProfile } from "@/api/organizer";
import { OrganizerInfo } from "@/types/OrganizerInfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";


export default function OrganizerProfile() {
    const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery<OrganizerInfo>({
    queryKey: ["organizerProfile"],
    queryFn: getOrgProfile,
  });
  return (
    <View>
        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        {isError && <Text>Error: {(error as Error)?.message ?? "Something went wrong"}</Text>}
        {data && <>
        <Text>{data.name}</Text>
        <Text>{data.email}</Text>
        <Text>{data.phone}</Text>
        <Text>{data.address}</Text>
        <Text>{data.website}</Text>
        <Text>{data.bio}</Text>
        <Text>{data.rating}</Text>
        </>
        }
    </View>
  );
}