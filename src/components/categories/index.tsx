import { FlatList, View } from "react-native";
import { Category } from "../category";
import { s } from "./styles";

export type CategoriesProps = {
  id: string;
  name: string;
}[];

type Props = {
  data: CategoriesProps;
  selected: string;
  onSelect: (id: string) => void;
};

export function Categories({ data, selected, onSelect }: Props) {
  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Category
            name={item.name}
            iconId={item.id}
            isSelected={item.id === selected}
            onPress={() => {
              onSelect(item.id);
            }}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.content}
        style={s.container}
      />
    </View>
  );
}
