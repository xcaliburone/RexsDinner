# import numpy as np
# import matplotlib.pyplot as plt

# # Parameter
# k = 1.0         # Konstanta pegas
# m = 1.0         # Massa benda
# x0 = 1.0        # Posisi awal
# v0 = 0.0        # Kecepatan awal
# t_final = 20    # Waktu akhir
# dt = 0.01       # Langkah waktu

# # Inisialisasi
# n_steps = int(t_final / dt)
# t_values = np.linspace(0, t_final, n_steps + 1)
# x_values = np.zeros(n_steps + 1)
# v_values = np.zeros(n_steps + 1)
# x_values[0] = x0
# v_values[0] = v0

# # Metode Euler
# for n in range(n_steps):
#     x_values[n + 1] = x_values[n] + dt * v_values[n]
#     v_values[n + 1] = v_values[n] + dt * (- (k / m) * x_values[n])

# # Plot hasil
# plt.plot(t_values, x_values, label='Metode Euler - Posisi')
# plt.plot(t_values, v_values, label='Metode Euler - Kecepatan')
# plt.xlabel('Waktu')
# plt.ylabel('Posisi / Kecepatan')
# plt.title('Gerak Harmonik Sederhana dengan Metode Euler')
# plt.legend()
# plt.grid(True)
# plt.show()

import numpy as np
import matplotlib.pyplot as plt

# Parameter
k = 1.0         # Konstanta pegas
m = 1.0         # Massa benda
x0 = 1.0        # Posisi awal
v0 = 0.0        # Kecepatan awal
t_final = 20    # Waktu akhir
dt = 0.01       # Langkah waktu

# Inisialisasi
n_steps = int(t_final / dt)
t_values = np.linspace(0, t_final, n_steps + 1)
x_values = np.zeros(n_steps + 1)
v_values = np.zeros(n_steps + 1)
x_values[0] = x0
v_values[0] = v0

# Metode Euler
for n in range(n_steps):
    x_values[n + 1] = x_values[n] + dt * v_values[n]
    v_values[n + 1] = v_values[n] + dt * (- (k / m) * x_values[n])

# Solusi analitik
omega = np.sqrt(k / m)
x_analytic = x0 * np.cos(omega * t_values) + (v0 / omega) * np.sin(omega * t_values)

# Plot hasil
plt.figure(figsize=(12, 6))
plt.plot(t_values, x_values, label='Metode Euler - Posisi')
plt.plot(t_values, v_values, label='Metode Euler - Kecepatan')
plt.plot(t_values, x_analytic, label='Solusi Analitik - Posisi', linestyle='dashed')
plt.xlabel('Waktu')
plt.ylabel('Posisi / Kecepatan')
plt.title('Gerak Harmonik Sederhana: Solusi Numerik dan Analitik')
plt.legend()
plt.grid(True)
plt.show()