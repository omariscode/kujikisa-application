import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/src/theme/ThemeContext";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { colors, backgrounds, radius } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: backgrounds.screen }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: backgrounds.card,
            borderRadius: radius.card,
            borderColor: colors.error,
          },
        ]}
      >
        <Text style={[styles.emoji]}>⚠️</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Ocorreu um erro
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {error?.message || "Algo deu errado. Tente novamente."}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, borderRadius: radius.button }]}
          onPress={onRetry}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    maxWidth: 400,
    width: "100%",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
