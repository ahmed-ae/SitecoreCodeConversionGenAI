import { Session } from "next-auth";

export interface UserPreferences {
  language: string;
  model: string;
  customInstructions: string;
  lastCodeUsed: string;
  CountUsage: number;
  maxTries: number;
  styling:string,
  framework:string
}

export const savePreferences = async (
  session: Session | null,
  preferences: Partial<UserPreferences>
) => {
  if (session?.user?.id) {
    // Save preferences to API if user is logged in
    await fetch("/api/user/userPreferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: session.user.id,
        ...preferences,
      }),
    });
  } else {
    // Save preferences to local storage if user is not logged in
    const storedPreferences = localStorage.getItem("userPreferences");
    const existingPreferences: UserPreferences = storedPreferences
      ? JSON.parse(storedPreferences)
      : ({} as UserPreferences);
    const updatedPreferences = { ...existingPreferences, ...preferences };
    localStorage.setItem("userPreferences", JSON.stringify(updatedPreferences));
  }
};

export const updateUsageCount = async (
  session: Session | null,
  sourceCode: string,
  currentCount: number,
  framework:string,
  styling:string
): Promise<number> => {
  const newCount = currentCount + 1;
  if (session?.user?.id) {
    const response = await fetch("/api/user/usageCount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: session.user.id,
        lastCodeUsed: sourceCode,
        CountUsage: newCount,
        framework: framework,
        styling: styling
      }),
    });
    const data = await response.json();
    return data.CountUsage;
  } else {
    // Update usage count in local storage if user is not logged in
    const storedPreferences = localStorage.getItem("userPreferences");
    const preferences: UserPreferences = storedPreferences
      ? JSON.parse(storedPreferences)
      : ({} as UserPreferences);
    preferences.lastCodeUsed = sourceCode;
    preferences.CountUsage = newCount;
    preferences.framework = framework;
    preferences.styling = styling;
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    return newCount;
  }
};

export const getPreferences = async (
  session: Session | null
): Promise<UserPreferences> => {
  if (session?.user?.id) {
    // Fetch user preferences from API
    const response = await fetch(
      `/api/user/userPreferences?userId=${session.user.id}`
    );
    localStorage.setItem("userPreferences", '')
    return await response.json();
  } else {
    // Load preferences from local storage if user is not logged in
    const storedPreferences = localStorage.getItem("userPreferences");
    return storedPreferences
      ? JSON.parse(storedPreferences)
      : ({} as UserPreferences);
  }
};
