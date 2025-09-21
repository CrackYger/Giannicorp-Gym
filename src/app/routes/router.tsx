import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import { lazy } from "react";
import { ensureSeedOnBoot } from "../../data/seeds/ensureOnBoot";
void ensureSeedOnBoot();

const OnboardingLayout = lazy(() => import("../../features/onboarding/OnboardingLayout"));

const OnbWelcome = lazy(() => import("../../features/onboarding/steps/Welcome"));
const OnbUnits = lazy(() => import("../../features/onboarding/steps/Units"));
const OnbExperience = lazy(() => import("../../features/onboarding/steps/ExperienceGoal"));
const OnbFrequency = lazy(() => import("../../features/onboarding/steps/FrequencyFocus"));
const OnbDefaults = lazy(() => import("../../features/onboarding/steps/WorkoutDefaults"));
const OnbHaptics = lazy(() => import("../../features/onboarding/steps/Haptics"));
const OnbImport = lazy(() => import("../../features/onboarding/steps/ImportStep"));
const OnbStarter = lazy(() => import("../../features/onboarding/steps/StarterTemplate"));
const OnbFinish = lazy(() => import("../../features/onboarding/steps/Finish"));


const Dashboard = lazy(() => import("../../features/dashboard/Dashboard"));
const Start = lazy(() => import("../../features/start/Start"));
const Exercises = lazy(() => import("../../features/exercises/Exercises"));
const History = lazy(() => import("../../features/history/History"));
const HistoryDetail = lazy(() => import("../../features/history/HistoryDetail"));
const Profile = lazy(() => import("../../features/profile/Profile"));
const BadgesPage = lazy(() => import("../../features/profile/BadgesPage"));

const ActiveWorkout = lazy(() => import("../../features/workout/ActiveWorkout"));
const Review = lazy(() => import("../../features/workout/Review"));

const SetsByMuscle = lazy(() => import("../../features/analytics/SetsByMuscle"));
const Frequency = lazy(() => import("../../features/analytics/Frequency"));
const Undertrained = lazy(() => import("../../features/analytics/Undertrained"));
const ExerciseDetail = lazy(() => import("../../features/exercises/ExerciseDetail"));
const TemplatesPage = lazy(() => import("../../features/templates/TemplatesPage"));


export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/start", element: <Start /> },
      { path: "/exercises", element: <Exercises /> },
      { path: "/history", element: <History /> },
      { path: "/history/:id", element: <HistoryDetail /> },
      { path: "/profile", element: <Profile /> },
      { path: "/profile/badges", element: <BadgesPage /> },
      { path: "/analytics/sets-by-muscle", element: <SetsByMuscle /> },
      { path: "/analytics/frequency", element: <Frequency /> },
      { path: "/analytics/undertrained", element: <Undertrained /> },
      { path: "/exercises/:id", element: <ExerciseDetail /> },
      { path: "/templates", element: <TemplatesPage /> },
      { path: "/workout/:id", element: <ActiveWorkout /> },
      { path: "/workout/:id/review", element: <Review /> },
    ],
  },

  
  {
    path: "/onboarding",
    element: <OnboardingLayout />,
    children: [
      { path: "welcome", element: <OnbWelcome /> },
      { path: "units", element: <OnbUnits /> },
      { path: "experience", element: <OnbExperience /> },
      { path: "frequency", element: <OnbFrequency /> },
      { path: "defaults", element: <OnbDefaults /> },
      { path: "haptics", element: <OnbHaptics /> },
      { path: "import", element: <OnbImport /> },
      { path: "starter", element: <OnbStarter /> },
      { path: "finish", element: <OnbFinish /> },
      { index: true, element: <OnbWelcome /> }
    ]
  },

]);