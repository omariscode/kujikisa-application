# Kujikisa ESP32 — API Completa (Standalone)

Documentação definitiva para o app mobile consumir a API local do dispensador
Kujikisa. O ESP32 é **100% autónomo** — não precisa de PC, nem Django, nem internet.

Tudo corre no próprio ESP32: utilizadores, autenticação, prescrições, eventos,
e a lógica de dispensação.

---

## Visão Geral

```
App Mobile <---- HTTP ----> ESP32 (192.168.4.1:80)
                                ├── SQLite (utilizadores, prescrições, eventos, schedule)
                                ├── GPIO (servos, buzzer, botão, sensores)
                                └── WiFi AP (sempre ligado)
```

**Nada depende de um servidor externo.** O PC com Django é opcional para backup.

### Hardware

| Componente | Especificação |
|---|---|
| Microcontrolador | ESP32 (ESP32 Dev Module) |
| Atuador | 1 servo motor 360° (GPIO 13) |
| Slots | 3 (ângulos: 0°, 120°, 240°) |
| Botão confirmação | GPIO 33 (INPUT_PULLUP) |
| Buzzer | GPIO 27 |
| LED status | GPIO 2 |
| Sensor água | GPIO 34 (analógico) |
| Sensor bateria | GPIO 35 (analógico) |

### Estado do Firmware

| Item | Valor |
|---|---|
| Serial | `KUJIKISA-ESP32-001` |
| Firmware | `1.0.0-standalone` |
| AP SSID | `Kujikisa-Setup` |
| AP Password | `kujikisa123` |
| IP em modo AP | `http://192.168.4.1` |
| mDNS | `http://kujikisa.local` |
| Porta | `80` |
| Auth | Bearer token (SHA256 + token aleatório 32 chars hex) |
| Armazenamento | SQLite em LittleFS (`/littlefs/kujikisa.db`) |
| Slots físicos | 3 (ângulos 0°, 120°, 240°) |
| Servo | 1 servo 360° com `writeMicroseconds()` (500-2500µs) |

### Descoberta do Dispositivo

O app deve tentar, por ordem:

1. `http://kujikisa.local` (mDNS na rede local)
2. `http://192.168.4.1` (AP do ESP32)

A rede AP está sempre disponível mesmo quando o ESP32 está ligado ao WiFi de casa
(modo AP+Station simultâneo).

### Autenticação

A maioria dos endpoints exige `Authorization: Bearer <token>` no header.

Fluxo:
1. `POST /api/users/register/` — criar conta
2. `POST /api/users/login/` — obter token
3. Usar token em todos os requests seguintes
4. `POST /api/users/logout/` — invalidar token

### Regras Gerais

- Base URL: `http://192.168.4.1` (AP) ou `http://kujikisa.local` (LAN)
- Content-Type: `application/json`
- Respostas: `application/json`
- Erros: `{ "detail": "..." }`
- Timeout recomendado: 3–8 segundos

---

## Base de Dados SQLite (On-Device)

O ESP32 utiliza SQLite em LittleFS com as seguintes tabelas:

### `users`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK | ID do utilizador |
| `email` | TEXT UNIQUE | Email |
| `password_hash` | TEXT | Hash SHA256 da password |
| `full_name` | TEXT | Nome completo |
| `phone` | TEXT | Telefone |
| `fcm_token` | TEXT | Token FCM (não implementado) |
| `is_active` | INTEGER | 1 = activo |
| `is_staff` | INTEGER | 1 = admin |

### `auth_tokens`
| Coluna | Tipo | Descrição |
|---|---|---|
| `token` | TEXT PK | Token de acesso (32 chars hex) |
| `user_id` | INTEGER FK | Referência ao utilizador |

### `prescriptions`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK | ID da prescrição |
| `user_id` | INTEGER FK | Dono da prescrição |
| `device_id` | INTEGER | ID do dispositivo (sempre 1) |
| `name` | TEXT | Nome da prescrição (ex: "Antibiótico Junho") |
| `start_date` | TEXT | Data inicial `YYYY-MM-DD` |
| `end_date` | TEXT | Data final `YYYY-MM-DD` |
| `is_active` | INTEGER | 1 = activo |
| `notes` | TEXT | Observações |

### `prescription_items`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK | ID do item |
| `prescription_id` | INTEGER FK | Prescrição pai |
| `name` | TEXT | Nome do medicamento |
| `dose_quantity` | TEXT | Ex: "1 comprimido" |
| `scheduled_time` | TEXT | Horário `HH:MM` |
| `slot_number` | INTEGER | Slot físico 1..3 |

### `events`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK | ID do evento |
| `prescription_item_id` | INTEGER | ID do item (-1 se manual) |
| `user_id` | INTEGER | ID do utilizador |
| `status` | TEXT | `dispensed`, `taken`, `missed`, `confirmed_app`, `manual` |
| `slot_number` | INTEGER | Slot físico |
| `occurred_at` | TEXT | ISO datetime do evento |
| `taken_at` | TEXT | ISO datetime da tomada |
| `confirmed_by_device` | INTEGER | 1 = confirmado pelo botão físico |
| `confirmed_by_app` | INTEGER | 1 = confirmado pelo app |

### `schedule`
Schedule compilado (reconstruído automaticamente via `rebuildSchedule()` sempre
que uma prescrição é criada/alterada/removida). Contém os mesmos campos que
`prescription_items` + `prescription_id`, `user_id`, `start_date`, `end_date`, `active`.

---

## Endpoints — Sem Autenticação

### `GET /`

Verifica se o servidor HTTP está vivo.

**Resposta** `200 text/plain`:
```
Kujikisa ESP32 local server.
```

---

### `GET /api/health`

Saúde básica do firmware.

**Resposta** `200`:
```json
{
  "ok": true,
  "serial_number": "KUJIKISA-ESP32-001",
  "firmware_version": "1.0.0-standalone"
}
```

---

### `GET /api/status`

Estado operacional completo do ESP32.

**Resposta** `200`:
```json
{
  "serial_number": "KUJIKISA-ESP32-001",
  "firmware_version": "1.0.0-standalone",
  "ap_ip": "192.168.4.1",
  "station_ip": "192.168.1.50",
  "station_connected": true,
  "water_level_pct": 82,
  "battery_level_pct": 85,
  "time": "2026-06-05T10:30:00Z",
  "active_slot": -1,
  "storage_ready": true,
  "users_count": 2
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `serial_number` | string | Serial do dispositivo |
| `firmware_version` | string | Versão do firmware |
| `ap_ip` | string | IP do Access Point |
| `station_ip` | string | IP na rede de casa (pode ser `0.0.0.0`) |
| `station_connected` | boolean | Se está ligado ao WiFi de casa |
| `water_level_pct` | int | Nível de água estimado |
| `battery_level_pct` | int | Nível da bateria estimado |
| `time` | string | Hora ISO atual (vazia se relógio não definido) |
| `active_slot` | int | Slot em janela de confirmação (`-1` = nenhum) |
| `storage_ready` | boolean | LittleFS montado |
| `users_count` | int | Nº de utilizadores registados |

---

### `POST /api/time`

Acerta o relógio do ESP32. **Deve ser chamado sempre que o app conectar.**
O tempo é persistido em NVS e restaurado após reboot (fallback até NTP sincronizar).

**Request**:
```json
{
  "epoch": 1780587000
}
```

**Resposta** `200`:
```json
{
  "detail": "Hora actualizada."
}
```

**Erro** `400`:
```json
{
  "detail": "epoch e obrigatorio."
}
```

---

### `POST /api/wifi`

Guarda credenciais WiFi no ESP32 (NVS persistente). Requer reboot para aplicar.

**Request**:
```json
{
  "ssid": "MinhaRede",
  "password": "minha-password"
}
```

**Resposta** `200`:
```json
{
  "detail": "WiFi guardado. Reinicie."
}
```

---

### `GET /api/config`

Configuração atual do dispositivo.

**Resposta** `200`:
```json
{
  "serial_number": "KUJIKISA-ESP32-001",
  "firmware_version": "1.0.0-standalone",
  "ap_ssid": "Kujikisa-Setup",
  "station_connected": true,
  "station_ip": "192.168.1.50",
  "time": "2026-06-05T10:30:00Z"
}
```

---

## Endpoints — Autenticação

### `POST /api/users/register/`

Criar nova conta de utilizador.

**Request**:
```json
{
  "email": "maria@example.com",
  "password": "password123",
  "full_name": "Maria Silva",
  "phone": "+244923000000"
}
```

**Resposta** `201`:
```json
{
  "id": 1,
  "email": "maria@example.com",
  "full_name": "Maria Silva"
}
```

**Erro** `400`:
```json
{
  "detail": "Email ja registado."
}
```

---

### `POST /api/users/login/`

Iniciar sessão. Devolve token de acesso + dados do utilizador.

**Request**:
```json
{
  "email": "maria@example.com",
  "password": "password123"
}
```

**Resposta** `200`:
```json
{
  "access": "a1b2c3d4e5f6...32chars",
  "refresh": "a1b2c3d4e5f6...32chars",
  "user": {
    "id": 1,
    "email": "maria@example.com",
    "full_name": "Maria Silva",
    "phone": "+244923000000",
    "is_active": true,
    "is_staff": false
  }
}
```

**Erro** `401`:
```json
{
  "detail": "Credenciais invalidas."
}
```

> Nota: O `refresh` tem o mesmo valor que `access` (token único, sem refresh rotation).

---

### `GET /api/users/profile/`

Obter perfil do utilizador autenticado.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "id": 1,
  "email": "maria@example.com",
  "full_name": "Maria Silva",
  "phone": "+244923000000",
  "is_active": true,
  "is_staff": false
}
```

---

### `PUT /api/users/profile/`

Atualizar perfil completo.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "full_name": "Maria Santos",
  "phone": "+244923111111"
}
```

**Resposta** `200`:
```json
{
  "detail": "Perfil actualizado."
}
```

---

### `PATCH /api/users/profile/`

Atualização parcial do perfil (mesmo que PUT, aceita campos parciais).

---

### `POST /api/users/change-password/`

Alterar a password.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "current_password": "password123",
  "new_password": "novaPassword456"
}
```

**Resposta** `200`:
```json
{
  "detail": "Password alterada."
}
```

---

### `POST /api/users/logout/`

Invalidar o token atual.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "detail": "Sessao terminada."
}
```

---

## Endpoints — Prescrições

### `GET /api/medications/prescriptions/`

Lista as prescrições do utilizador autenticado.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "results": [
    {
      "id": 1,
      "user_id": 1,
      "device_id": 1,
      "name": "Antibiótico Junho",
      "start_date": "2026-06-01",
      "end_date": "2026-06-30",
      "is_active": true,
      "notes": "Tomar com agua.",
      "items": [
        {
          "id": 1,
          "name": "Paracetamol",
          "dose_quantity": "1 comprimido",
          "scheduled_time": "08:00",
          "slot_number": 1
        },
        {
          "id": 2,
          "name": "Amoxicilina",
          "dose_quantity": "1 comprimido",
          "scheduled_time": "20:00",
          "slot_number": 2
        }
      ]
    }
  ]
}
```

> Nota: `dose_quantity` é uma **string** no ESP32 (ex: "1 comprimido"), ao contrário do Django onde é um número inteiro.

---

### `POST /api/medications/prescriptions/`

Criar uma nova prescrição com items. O schedule do dispensador é
**automaticamente recompilado** após criar/editar/remover prescrições.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "name": "Antibiótico Junho",
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "is_active": true,
  "notes": "Tomar com agua.",
  "items": [
    {
      "name": "Paracetamol",
      "dose_quantity": "1 comprimido",
      "scheduled_time": "08:00",
      "slot_number": 1
    },
    {
      "name": "Amoxicilina",
      "dose_quantity": "1 comprimido",
      "scheduled_time": "20:00",
      "slot_number": 2
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string | Não | Nome da prescrição (ex: "Antibiótico Junho") |
| `start_date` | string | Sim | Data inicial `YYYY-MM-DD` |
| `end_date` | string | Não | Data final `YYYY-MM-DD` |
| `is_active` | boolean | Não | `true` por defeito |
| `notes` | string | Não | Observações |
| `items` | array | Sim | Mínimo 1 item |
| `items[].name` | string | Sim | Nome do medicamento |
| `items[].dose_quantity` | string | Não | Ex: "1 comprimido" |
| `items[].scheduled_time` | string | Sim | Horário `HH:MM` |
| `items[].slot_number` | int | Sim | Slot físico `1..3` |

**Resposta** `201`:
```json
{
  "id": 1,
  "detail": "Prescricao criada."
}
```

---

### `GET /api/medications/prescriptions/{id}/`

Detalhe de uma prescrição específica.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "id": 1,
  "user_id": 1,
  "device_id": 1,
  "name": "Antibiótico Junho",
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "is_active": true,
  "notes": "Tomar com agua.",
  "items": [
    {
      "id": 1,
      "name": "Paracetamol",
      "dose_quantity": "1 comprimido",
      "scheduled_time": "08:00",
      "slot_number": 1
    }
  ]
}
```

---

### `PUT /api/medications/prescriptions/{id}/`

Atualizar prescrição completa (substitui todos os items).

**Headers**: `Authorization: Bearer <token>`

**Request** (mesmo formato que POST):
```json
{
  "name": "Antibiótico (alterado)",
  "start_date": "2026-06-01",
  "end_date": "2026-07-15",
  "is_active": true,
  "notes": "Alterado para 1 mes e meio.",
  "items": [
    {
      "name": "Paracetamol",
      "dose_quantity": "1 comprimido",
      "scheduled_time": "08:00",
      "slot_number": 1
    },
    {
      "name": "Amoxicilina",
      "dose_quantity": "2 comprimidos",
      "scheduled_time": "20:00",
      "slot_number": 2
    }
  ]
}
```

**Resposta** `200`:
```json
{
  "detail": "Prescricao actualizada."
}
```

---

### `DELETE /api/medications/prescriptions/{id}/`

Remover uma prescrição.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "detail": "Prescricao removida."
}
```

---

## Endpoints — Eventos de Medicação

### `GET /api/medications/events/`

Lista os últimos 50 eventos do utilizador.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "results": [
    {
      "id": 5,
      "prescription_item_id": 1,
      "user_id": 1,
      "status": "taken",
      "slot_number": 1,
      "occurred_at": "2026-06-05T08:05:00Z",
      "taken_at": "2026-06-05T08:05:00Z",
      "confirmed_by_device": true,
      "confirmed_by_app": false
    },
    {
      "id": 4,
      "prescription_item_id": 2,
      "user_id": 1,
      "status": "missed",
      "slot_number": 2,
      "occurred_at": "2026-06-04T20:05:00Z",
      "taken_at": "",
      "confirmed_by_device": true,
      "confirmed_by_app": false
    }
  ]
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID único do evento |
| `prescription_item_id` | int | ID do item da prescrição |
| `user_id` | int | ID do utilizador |
| `status` | string | `dispensed`, `taken`, `missed`, `confirmed_app`, `manual` |
| `slot_number` | int | Slot físico |
| `occurred_at` | string | ISO datetime do evento |
| `taken_at` | string | ISO datetime da tomada (vazio se missed) |
| `confirmed_by_device` | bool | Confirmado pelo botão físico |
| `confirmed_by_app` | bool | Confirmado pelo app |

#### Ciclo de Vida do Evento

O evento é **criado imediatamente** no momento da dispensa:

```
                    ┌──→ taken (botão físico pressionado)
                    │
dispensed ──────────┼──→ confirmed_app (app confirma via endpoint)
                    │
                    └──→ missed (timeout de 5 min sem confirmação)
```

**Quando o app ou botão confirma, o servo faz um gesto de confirmação**
(roda até ao ângulo do slot e volta ao home).

Eventos de teste via `/api/dispense` têm `status = manual`.

---

### `GET /api/medications/events/{id}/`

Detalhe de um evento específico.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`: (mesmo formato do item na lista)

---

### `POST /api/medications/events/{id}/confirm/`

Confirmar manualmente uma medicação pelo app. O body é ignorado —
o evento é sempre marcado como `confirmed_app`.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "detail": "Evento confirmado."
}
```

Se o evento corresponder ao que está em janela de confirmação activa,
a janela é cancelada.

---

### `POST /api/medications/take/`

Confirmar toma de medicamento por **slot number** (alternativa ao confirm por ID).
Procura o evento mais recente com `status = dispensed` para aquele slot e marca
como `confirmed_app`. O servo faz um gesto de confirmação (roda ao ângulo do slot
e volta ao home).

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "slot_number": 1
}
```

**Resposta** `200`:
```json
{
  "detail": "Medicamento tomado confirmado."
}
```

**Erro** `404`:
```json
{
  "detail": "Nenhum evento pendente para este slot."
}
```

---

## Endpoints — Dispositivo

### `GET /api/devices/`

Lista os dispositivos do utilizador. Devolve sempre este ESP32.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
[
  {
    "id": 1,
    "serial_number": "KUJIKISA-ESP32-001",
    "name": "Kujikisa Dispenser",
    "firmware_version": "1.0.0-standalone",
    "status": "online",
    "water_level_pct": 82,
    "battery_level_pct": 85,
    "owner": 1
  }
]
```

---

### `GET /api/devices/{id}/`

Detalhe do dispositivo.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "id": 1,
  "serial_number": "KUJIKISA-ESP32-001",
  "name": "Kujikisa Dispenser",
  "firmware_version": "1.0.0-standalone",
  "status": "online",
  "water_level_pct": 82,
  "battery_level_pct": 85,
  "last_seen": "2026-06-05T10:30:00Z",
  "owner": 1
}
```

---

### `POST /api/devices/pair/`

Vincula o dispositivo ao utilizador. **Não requer serial_number no body** —
o pairing é imediato pois o ESP32 é o próprio dispositivo.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "id": 1,
  "serial_number": "KUJIKISA-ESP32-001",
  "name": "Kujikisa Dispenser",
  "status": "paired"
}
```

---

### `POST /api/devices/{id}/unpair/`

Desvincula o dispositivo.

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`:
```json
{
  "detail": "Dispositivo desvinculado."
}
```

---

### `PATCH /api/devices/{id}/rename/`

Renomear o dispositivo (persistido em NVS).

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "name": "Dispensador da Sala"
}
```

**Resposta** `200`:
```json
{
  "detail": "Dispositivo renomeado."
}
```

---

### `GET /api/devices/{id}/logs/`

Últimos 50 eventos do dispositivo (mesmo que events).

**Headers**: `Authorization: Bearer <token>`

**Resposta** `200`: (mesmo formato de eventos)

---

### `GET /api/devices/{id}/local-schedule/`

Schedule exportado para compatibilidade com o formato Django.
**Nota: este endpoint NÃO requer autenticação** (acesso público).

**Resposta** `200`:
```json
{
  "schema_version": 1,
  "device_serial": "KUJIKISA-ESP32-001",
  "items": [
    {
      "id": 1,
      "prescription_id": 1,
      "user_id": 1,
      "name": "Paracetamol",
      "dose_quantity": "1 comprimido",
      "slot_number": 1,
      "scheduled_time": "08:00",
      "start_date": "2026-06-01",
      "end_date": "2026-06-30",
      "active": true
    }
  ]
}
```

---

### `POST /api/devices/{id}/local-events/`

Sincronizar eventos registados offline pelo ESP32 (formato compatível com Django).

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "events": [
    {
      "local_event_id": "KUJIKISA-ESP32-001-1780587000-2",
      "slot_number": 2,
      "status": "taken",
      "occurred_at": "2026-06-05T08:35:00Z"
    }
  ]
}
```

**Resposta** `200`:
```json
{
  "synced": [
    {
      "local_event_id": "KUJIKISA-ESP32-001-1780587000-2",
      "event_id": 6
    }
  ],
  "errors": []
}
```

---

## Endpoints — Schedule do Dispensador (Legado/Interno)

### `GET /api/schedule`

Retorna o schedule atualmente guardado na tabela SQLite. Usado internamente pelo
dispensador e para debug.

**Resposta** `200`:
```json
{
  "schema_version": 1,
  "device_serial": "KUJIKISA-ESP32-001",
  "items": [
    {
      "id": 1,
      "prescription_id": 1,
      "user_id": 1,
      "name": "Paracetamol",
      "dose_quantity": "1 comprimido",
      "slot_number": 1,
      "scheduled_time": "08:00",
      "start_date": "2026-06-01",
      "end_date": "2026-06-30",
      "active": true
    }
  ]
}
```

---

### `POST /api/schedule`

Substitui todo o schedule manualmente. Normalmente é gerido automaticamente
pelas prescrições, mas pode ser usado para override direto.

**Resposta** `200`:
```json
{
  "detail": "Agenda guardada."
}
```

---

### `GET /api/history`

Retorna todos os eventos como array (até 200). Equivalente ao events.

**Resposta** `200`:
```json
{
  "results": [...]
}
```

---

### `DELETE /api/history`

Limpa todos os eventos.

**Resposta** `200`:
```json
{
  "detail": "Historico limpo."
}
```

---

### `POST /api/dispense`

Acciona o servo manualmente (teste/manutenção). **Endpoint sem autenticação.**

Se `slot_number` for fornecido (1-3), executa a dispensação do slot
(roda ao ângulo do slot, espera 900ms, volta ao home) e regista evento
com `status = manual`. Caso contrário, roda o servo para um ângulo de
teste (90° por defeito, ou o ângulo enviado, 0-360°).

O servo usa `writeMicroseconds()` com mapeamento `DEG_TO_PULSE`:
500µs = 0°, 1500µs = 180°, 2500µs = 360°.

**Request** (com slot):
```json
{
  "slot_number": 1
}
```

**Request** (teste — sem slot, apenas rodar o servo):
```json
{}
```

**Request** (teste com ângulo personalizado):
```json
{
  "angle": 240
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `slot_number` | int | Não | Slot 1..3 (físico) |
| `angle` | int | Não | Ângulo 0..360° (usado se slot_number não fornecido) |

**Respostas** `200`:
```json
// Com slot_number
{ "detail": "Slot accionado." }

// Sem parâmetros
{ "detail": "Teste: servo rodado para 90 graus." }

// Com angle personalizado
{ "detail": "Servo rodado para angulo informado." }
```

---

## Lógica de Dispensação

O ESP32 corre um ciclo contínuo que:

1. **`checkSchedule()`** — A cada minuto, verifica se algum item do schedule
   corresponde ao horário actual. Se sim:
   - Roda o servo para o ângulo do slot (`SLOT_ANGLES[slot-1]`)
   - Aguarda `DISPENSE_HOLD_MS` (900ms)
   - Retorna ao `HOME_ANGLE` (0°)
   - Toca 3 beeps
   - **Cria imediatamente** evento com `status = dispensed`
   - Inicia janela de confirmação de 5 minutos

2. **`checkConfirmation()`** — Se há uma janela de confirmação activa:
   - **Botão físico** (`CONFIRM_BUTTON_PIN`, GPIO 33, INPUT_PULLUP):
     - `activeEventId` actualizado para `taken` via `DB.eventSetTaken()`
     - 1 beep de confirmação
   - **Confirmação do app** (`POST /api/medications/take/` ou `/confirm/`):
     - Evento marcado como `confirmed_app`
     - **Servo faz gesto de confirmação** (roda ao ângulo do slot e volta)
   - **Timeout** (5 min sem confirmação):
     - Evento actualizado para `missed` via `DB.eventSetMissed()`
     - 2 beeps de aviso

3. **Gestão de Tempo**:
   - Tenta NTP (`pool.ntp.org`, `time.nist.gov`) no boot
   - Se NTP falhar: restaura tempo persistido em NVS (`Preferences`)
   - Re-tenta NTP a cada 30s enquanto WiFi estiver ligado e NTP não sincronizado
   - Após NTP sincronizado: persiste o tempo a cada 5 min
   - Timezone: `WAT-1` (West Africa Time)
   - Fallback manual: `POST /api/time` (também persiste em NVS)

4. **LED**:
   - Ligado fixo: WiFi station conectado
   - Piscando (500ms): Apenas modo AP

---

## Fluxo Completo do App

### 1. Primeira Vez (Setup)

```
1. Utilizador liga o dispensador
2. App detecta WiFi "Kujikisa-Setup"
3. App conecta-se ao AP
4. GET /api/health         → confirma firmware
5. GET /api/status          → estado geral
6. POST /api/wifi           → guarda WiFi de casa
7. Utilizador reinicia o ESP32
8. ESP32 liga-se ao WiFi de casa + mantém AP
9. POST /api/time           → acerta relógio
10. POST /api/users/register/ → criar conta
11. POST /api/users/login/    → obter token
12. POST /api/devices/pair/   → vincular dispositivo
```

### 2. Configurar Medicação

```
1. POST /api/time                → acertar relógio
2. POST /api/users/login/        → obter token
3. POST /api/medications/prescriptions/
   ├── items[0].name = "Paracetamol"
   ├── items[0].scheduled_time = "08:00"
   ├── items[0].slot_number = 1
   └── items[0].dose_quantity = "1 comprimido"
4. GET /api/medications/prescriptions/ → confirmar
```

### 3. Uso Diário

```
1. GET /api/status          → verificar nível água/bateria
2. GET /api/medications/events/ → ver histórico do dia
```

### 4. Manutenção

```
POST /api/dispense          → testar slot manualmente
GET  /api/status            → verificar sensores
POST /api/change-password/  → alterar password
```

---

## Códigos de Erro

| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Criado |
| 204 | Sem conteúdo (CORS preflight) |
| 400 | Payload inválido ou campo obrigatório ausente |
| 401 | Token ausente, inválido ou expirado |
| 404 | Endpoint ou recurso não encontrado |
| 500 | Erro interno (ex: SQLite) |

Resposta padrão de erro:
```json
{
  "detail": "Mensagem descritiva do erro."
}
```

---

## Comandos de Teste (curl)

### Setup Inicial
```bash
# Conectar ao WiFi Kujikisa-Setup primeiro
BASE="http://192.168.4.1"

# Health check
curl $BASE/api/health

# Status
curl $BASE/api/status

# Acertar relógio
curl -X POST $BASE/api/time \
  -H "Content-Type: application/json" \
  -d '{"epoch":'$(date +%s)'}'

# Registar utilizador
curl -X POST $BASE/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"12345678","full_name":"Teste"}'

# Login
TOKEN=$(curl -s -X POST $BASE/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"12345678"}' | \
  python3 -c "import sys,json;print(json.load(sys.stdin)['access'])")

echo "Token: $TOKEN"

# Criar prescrição
curl -X POST $BASE/api/medications/prescriptions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Antibiotico Junho",
    "start_date": "2026-06-05",
    "items": [
      {"name":"Paracetamol","dose_quantity":"1 comprimido","scheduled_time":"08:00","slot_number":1},
      {"name":"Amoxicilina","dose_quantity":"1 comprimido","scheduled_time":"20:00","slot_number":2}
    ]
  }'

# Listar prescrições
curl -H "Authorization: Bearer $TOKEN" $BASE/api/medications/prescriptions/

# Ver eventos
curl -H "Authorization: Bearer $TOKEN" $BASE/api/medications/events/

# Confirmar toma por slot
curl -X POST $BASE/api/medications/take/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"slot_number":1}'

# Dispensar manualmente (teste)
curl -X POST $BASE/api/dispense \
  -H "Content-Type: application/json" \
  -d '{"slot_number":1}'

# Logout
curl -X POST $BASE/api/users/logout/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Exemplo Mobile (JavaScript)

```javascript
const BASE_URL = "http://192.168.4.1";
const TIMEOUT_MS = 6000;

async function esp32Fetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail || `Erro ${res.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// Descobrir ESP32
async function discover() {
  for (const url of ["http://kujikisa.local", "http://192.168.4.1"]) {
    try {
      const health = await esp32Fetch("/api/health", { base: url });
      if (health?.ok) return url;
    } catch {}
  }
  throw new Error("Dispensador nao encontrado.");
}

// Login
async function login(email, password) {
  const data = await esp32Fetch("/api/users/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.access; // token
}

// Criar prescrição
async function createPrescription(token, prescription) {
  return esp32Fetch("/api/medications/prescriptions/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(prescription),
  });
}

// Listar eventos
async function getEvents(token) {
  return esp32Fetch("/api/medications/events/", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Acertar relógio
async function syncTime() {
  return esp32Fetch("/api/time", {
    method: "POST",
    body: JSON.stringify({ epoch: Math.floor(Date.now() / 1000) }),
  });
}

// Confirmar toma por slot
async function confirmTake(token, slotNumber) {
  return esp32Fetch("/api/medications/take/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slot_number: slotNumber }),
  });
}
```

Agora, tens como adicionar uma cena, para sempre que toca a hora de um medicamento, ele toca um especie de alarme, pontualmente e em tempo real, ele toca uma especie de alarme-

---

## Notas de Segurança (Protótipo)

- As passwords são armazenadas com hash SHA256 (não bcrypt)
- Os tokens são aleatórios (32 caracteres hex)
- O AP tem password fixa (`kujikisa123`)
- O endpoint `/api/dispense` não tem auth (apenas para teste)
- O endpoint `/api/devices/{id}/local-schedule/` não tem auth (acesso público)
- Para produção: password AP única por serial, rate limiting, HTTPS, bcrypt nas passwords
