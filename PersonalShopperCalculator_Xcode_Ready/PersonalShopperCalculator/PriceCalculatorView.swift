import SwiftUI

struct PriceCalculatorView: View {
    @State private var productCost = ""
    @State private var transport = ""
    @State private var lodging = ""
    @State private var food = ""
    @State private var freight = ""
    @State private var taxes = ""
    
    @State private var length = ""
    @State private var width = ""
    @State private var height = ""

    @State private var exchangeRate = "540"
    @State private var profitMargin = "30"

    @State private var totalUSD = 0.0
    @State private var profitUSD = 0.0
    @State private var totalCRC = 0.0
    @State private var cubicFeet = 0.0

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    Group {
                        SectionHeader("Costos")
                        CurrencyField("Costo del producto (USD)", text: $productCost)
                        CurrencyField("Transporte local", text: $transport)
                        CurrencyField("Hospedaje", text: $lodging)
                        CurrencyField("Alimentación", text: $food)
                        CurrencyField("Freight", text: $freight)
                        CurrencyField("Impuestos / Aduanas", text: $taxes)
                    }

                    Group {
                        SectionHeader("Cubicaje (pulgadas)")
                        NumberField("Largo (in)", text: $length)
                        NumberField("Ancho (in)", text: $width)
                        NumberField("Alto (in)", text: $height)
                    }

                    Group {
                        SectionHeader("Extras")
                        NumberField("Tipo de cambio CRC/USD", text: $exchangeRate)
                        NumberField("Margen de ganancia (%)", text: $profitMargin)
                    }

                    Button("Calcular") {
                        calculate()
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue.opacity(0.8))
                    .foregroundColor(.white)
                    .cornerRadius(10)

                    Group {
                        SectionHeader("Resultado")
                        Text("Pies cúbicos: \(String(format: "%.2f", cubicFeet))")
                        Text("Total en USD: $\(String(format: "%.2f", totalUSD))")
                        Text("Ganancia en USD: $\(String(format: "%.2f", profitUSD))")
                        Text("Total en CRC: ₡\(String(format: "%.0f", totalCRC))")
                    }
                }
                .padding()
            }
            .navigationTitle("Calculadora de Precios")
        }
    }

    func calculate() {
        let product = Double(productCost) ?? 0
        let totalViaticos = [transport, lodging, food, freight, taxes].compactMap { Double($0) }.reduce(0, +)
        let subtotal = product + totalViaticos

        let margin = (Double(profitMargin) ?? 0) / 100
        profitUSD = subtotal * margin
        totalUSD = subtotal + profitUSD

        let rate = Double(exchangeRate) ?? 0
        totalCRC = totalUSD * rate

        let l = Double(length) ?? 0
        let w = Double(width) ?? 0
        let h = Double(height) ?? 0
        cubicFeet = (l * w * h) / 1728.0
    }
}

struct SectionHeader: View {
    var text: String
    var body: some View {
        Text(text)
            .font(.headline)
            .padding(.top, 12)
    }
}

struct CurrencyField: View {
    var label: String
    @Binding var text: String
    var body: some View {
        TextField(label, text: $text)
            .keyboardType(.decimalPad)
            .textFieldStyle(.roundedBorder)
    }
}

struct NumberField: View {
    var label: String
    @Binding var text: String
    var body: some View {
        TextField(label, text: $text)
            .keyboardType(.decimalPad)
            .textFieldStyle(.roundedBorder)
    }
}
