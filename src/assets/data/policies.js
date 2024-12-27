export const policiesData = {
  items: [
    {
      id: "policy-base",
      category: "base",
      name: "消費税率据え置き",
      content: "消費税率10%維持",
      body: {
        "consumption_tax_rate": Object.fromEntries(
          Array.from({ length: 47 }, (_, i) => [2024 + i, 0.10])
        )
      }
    },
    {
      id: "policy-tax-increase",
      category: "tax",
      name: "消費税率引き上げ（2025年から1%ずつ15%まで）",
      content: "消費税率を段階的に15%まで引き上げ、その後15%を維持",
      body: {
        "consumption_tax_rate": {
          ...Object.fromEntries(
            Array.from({ length: 5 }, (_, i) => [
              2024 + i,
              0.10 + (0.05 * i / 4)
            ])
          ),
          ...Object.fromEntries(
            Array.from({ length: 42 }, (_, i) => [
              2029 + i,
              0.15
            ])
          )
        }
      }
    },
    {
      id: "policy-tax-decrease",
      category: "tax",
      name: "消費税率引き下げ（2025年から1%ずつ5%まで）",
      content: "消費税率を段階的に5%まで引き下げ、その後5%を維持",
      body: {
        "consumption_tax_rate": {
          ...Object.fromEntries(
            Array.from({ length: 5 }, (_, i) => [
              2024 + i,
              0.10 - (0.05 * i / 4)
            ])
          ),
          ...Object.fromEntries(
            Array.from({ length: 42 }, (_, i) => [
              2029 + i,
              0.05
            ])
          )
        }
      }
    }
  ]
}