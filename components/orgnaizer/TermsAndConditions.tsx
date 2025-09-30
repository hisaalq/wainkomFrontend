import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms and Conditions</Text>

        <Text style={styles.paragraph}>
          Welcome to <Text style={styles.bold}>Wainkom</Text>, the app that
          helps you discover, share, and attend events. By using Wainkom, you
          agree to the following terms and conditions:
        </Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, accessing, or using Wainkom, you agree to these Terms
          and Conditions. If you do not agree, please stop using the app.
        </Text>

        <Text style={styles.heading}>2. Purpose of the App</Text>
        <Text style={styles.paragraph}>
          Wainkom is designed to let users share events, explore activities, and
          connect with the community. You agree to use the app only for lawful
          and appropriate purposes.
        </Text>

        <Text style={styles.heading}>3. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          • You are responsible for the content you post, including event
          details, images, and comments.{"\n"}• Do not share offensive, harmful,
          or misleading content.{"\n"}• Respect the rights and privacy of other
          users and event organizers.
        </Text>

        <Text style={styles.heading}>4. Event Accuracy</Text>
        <Text style={styles.paragraph}>
          Wainkom does not guarantee that all event details are accurate or
          up-to-date. Event organizers are responsible for providing correct
          information.
        </Text>

        <Text style={styles.heading}>5. Privacy</Text>
        <Text style={styles.paragraph}>
          We value your privacy. Please review our Privacy Policy to understand
          how your information is collected, stored, and used.
        </Text>

        <Text style={styles.heading}>6. Limitations</Text>
        <Text style={styles.paragraph}>
          Wainkom is not liable for cancellations, changes, or damages related
          to events posted on the app. Attendance is at your own discretion and
          risk.
        </Text>

        <Text style={styles.heading}>7. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          Wainkom may update these Terms and Conditions at any time. Continued
          use of the app means you accept any changes.
        </Text>

        <Text style={styles.paragraph}>
          Thank you for being part of Wainkom and for helping build a stronger
          event-sharing community.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f0f10",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D1D5DB",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
