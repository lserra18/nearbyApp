import AlertModal, { AlertService } from "@/components/alert";
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { Coupon } from "@/components/market/coupon";
import { Cover } from "@/components/market/cover";
import { Details, DetailsProps } from "@/components/market/details";
import { api } from "@/services/api";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Alert, Modal, ScrollView, View } from "react-native";

type DataProps = DetailsProps & {
  cover: string;
};
export default function Market() {
  const [data, setData] = useState<DataProps>();
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponIsFetching, setCouponIsFetching] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isVisibleCameraModal, setIsVisibleCameraModal] = useState(false);
  const params = useLocalSearchParams<{ id: string }>();

  const qrLock = useRef(false);

  const [_, requestPermission] = useCameraPermissions();
  async function fetchMarket() {
    try {
      const { data } = await api.get(`/markets/${params.id}`);
      setData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Não foi possível carregar os dados", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();

      if (!granted) {
        return Alert.alert("Camera", "Você precisa habilitar o uso da câmera");
      }
      qrLock.current = false;
      setIsVisibleCameraModal(true);
    } catch (error) {
      console.log(error);
      Alert.alert("Camera", "Não foi possível utilizar a câmera");
    }
  }

  async function getCoupon(id: string) {
    try {
      setCouponIsFetching(true);

      const { data } = await api.patch("/coupons/" + id);

      setCoupon(data.coupon);
    } catch (error) {
      console.log("teste", error);
      AlertService.alert("Erro", "Não foi possível utilizar o cupom");
    } finally {
      setCouponIsFetching(false);
    }
  }

  function handleUseCoupon(id: string) {
    setIsVisibleCameraModal(false);

    console.log(id);
    Alert.alert(
      "Cupom",
      "Não é possível reutilizar um cupom resgatado. Deseja realmente resgatar o cupom?",
      [
        {
          style: "cancel",
          text: "Não",
        },
        { text: "Sim", onPress: () => getCoupon(id) },
      ]
    );
  }

  useEffect(() => {
    fetchMarket();
  }, [params.id]);

  if (isLoading) {
    return <Loading />;
  }

  console.log(params.id);
  if (!data) {
    return <Redirect href={"/home"} />;
  }
  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden={isVisibleCameraModal} style="light" />
      <Cover uri={data.cover} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Details data={data} />
        {coupon && <Coupon code={coupon} />}
        <View style={{ padding: 32, paddingTop: 12 }}>
          <Button onPress={handleOpenCamera}>
            <Button.Title>Ler QR Code</Button.Title>
          </Button>
        </View>
      </ScrollView>
      <Modal
        style={{ flex: 1 }}
        visible={isVisibleCameraModal}
        statusBarTranslucent
      >
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data && !qrLock.current) {
              qrLock.current = true;
              setTimeout(() => handleUseCoupon(data), 500);
            }
          }}
        />
        <View style={{ position: "absolute", bottom: 32, left: 32, right: 32 }}>
          <Button
            onPress={() => setIsVisibleCameraModal(false)}
            isLoading={couponIsFetching}
          >
            <Button.Title>Voltar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
