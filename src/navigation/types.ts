import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp, DrawerScreenProps } from '@react-navigation/drawer';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  CompositeNavigationProp,
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string };
  Terms: undefined;
  Privacy: undefined;
};

export type CustomerMenuStackParamList = {
  MealList: undefined;
  MealDetail: { mealId: string };
};

export type CustomerOrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
};

export type CustomerTabParamList = {
  CustomerOverview: undefined;
  CustomerMenu: NavigatorScreenParams<CustomerMenuStackParamList>;
  CustomerCart: undefined;
  CustomerOrders: NavigatorScreenParams<CustomerOrdersStackParamList>;
};

export type CustomerDrawerParamList = {
  CustomerMain: NavigatorScreenParams<CustomerTabParamList>;
  Notifications: NavigatorScreenParams<NotificationsStackParamList>;
  Settings: undefined;
};

export type CustomerRootStackParamList = {
  CustomerDrawer: NavigatorScreenParams<CustomerDrawerParamList> | undefined;
  CheckoutWebView: { orderId: string; checkoutUrl: string };
};

export type VendorOrdersStackParamList = {
  VendorOrderQueue: undefined;
  VendorOrderDetail: { orderId: string };
};

export type VendorMealsStackParamList = {
  VendorMealsList: undefined;
  VendorMealEditor: { mealId?: string };
};

export type NotificationsStackParamList = {
  NotificationsList: undefined;
  NotificationDetail: { notificationId: string };
};

export type VendorTabParamList = {
  VendorOverview: undefined;
  VendorOrders: NavigatorScreenParams<VendorOrdersStackParamList>;
  VendorMeals: NavigatorScreenParams<VendorMealsStackParamList>;
  VendorNotifications: NavigatorScreenParams<NotificationsStackParamList>;
};

export type RiderDeliveryStackParamList = {
  RiderDeliveryList: undefined;
  RiderOrderDetail: { orderId: string };
};

export type RiderTabParamList = {
  RiderOverview: undefined;
  RiderDeliveries: NavigatorScreenParams<RiderDeliveryStackParamList>;
  RiderNotifications: NavigatorScreenParams<NotificationsStackParamList>;
};

export type AdminTabParamList = {
  AdminOverview: undefined;
  AdminUsers: undefined;
  AdminNotifications: NavigatorScreenParams<NotificationsStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  CustomerRoot: NavigatorScreenParams<CustomerRootStackParamList>;
  VendorTabs: undefined;
  RiderTabs: undefined;
  AdminTabs: undefined;
};

/** Tab → drawer → customer root stack (e.g. cart → Stripe modal). */
export type CustomerCartNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, 'CustomerCart'>,
  CompositeNavigationProp<
    DrawerNavigationProp<CustomerDrawerParamList>,
    NativeStackNavigationProp<CustomerRootStackParamList>
  >
>;

export type CustomerOverviewNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, 'CustomerOverview'>,
  DrawerNavigationProp<CustomerDrawerParamList>
>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type CustomerDrawerProps<T extends keyof CustomerDrawerParamList> = CompositeScreenProps<
  DrawerScreenProps<CustomerDrawerParamList, T>,
  NativeStackScreenProps<CustomerRootStackParamList>
>;
