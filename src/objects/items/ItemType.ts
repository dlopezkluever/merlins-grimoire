export enum ItemType {
    HealthPotion = 'HealthPotion',
    SparkBoost = 'SparkBoost'
}

export const ItemTypeConfig = {
    [ItemType.HealthPotion]: {
        healAmount: 20
    },
    [ItemType.SparkBoost]: {
        speedBoostAmount: 1.5,
        duration: 5000
    }
}