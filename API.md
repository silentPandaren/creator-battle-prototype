# API Structure для Creator Battle

## Обзор

API для системы Creator Battle построено на Django REST Framework и интегрируется с существующими модулями `streamers` и `orders`.

## Базовый URL

```
/api/battles/
```

## Аутентификация

Все endpoints требуют аутентификации (кроме публичных данных события):
- `SiteRequired` - для публичных данных
- `IsAuthenticated` - для данных пользователя
- `ForceMigrationVerificationRequired` - для критичных операций

## Endpoints

### 1. Получение информации о событии

**GET** `/api/battles/{event_id}/`

Возвращает основную информацию о событии и командах.

**Response:**
```json
{
  "event": {
    "id": 1,
    "name": "Creator Battle",
    "description": "Соревнование между пилотами War Robots",
    "game_id": 123,
    "game_name": "War Robots",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-01-31T23:59:59Z",
    "is_active": true,
    "team_count": 2,
    "prizes": [
      {"place": 1, "value": 500},
      {"place": 2, "value": 400}
    ]
  },
  "teams": [
    {
      "id": 1,
      "name": "PilotStorm",
      "code": "STORM",
      "position": 1,
      "color": "#e84057",
      "streamer_id": 10,
      "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=storm"
    },
    {
      "id": 2,
      "name": "PilotVortex",
      "code": "VORTEX",
      "position": 2,
      "color": "#3079ff",
      "streamer_id": 11,
      "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=vortex"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - успешно
- `404 Not Found` - событие не найдено

---

### 2. Получение рейтинга команд

**GET** `/api/battles/{event_id}/leaderboard/`

Возвращает текущий рейтинг команд с их очками.

**Query Parameters:**
- `limit` (optional, default: all) - ограничение количества команд

**Response:**
```json
{
  "teams": [
    {
      "team_id": 1,
      "team_name": "PilotStorm",
      "position": 1,
      "total_points": 125000,
      "color": "#e84057",
      "streamer_code": "STORM"
    },
    {
      "team_id": 2,
      "team_name": "PilotVortex",
      "position": 2,
      "total_points": 98000,
      "color": "#3079ff",
      "streamer_code": "VORTEX"
    }
  ],
  "updated_at": "2025-01-15T14:30:00Z"
}
```

**Status Codes:**
- `200 OK` - успешно
- `404 Not Found` - событие не найдено

---

### 3. Получение топ донатеров команды

**GET** `/api/battles/teams/{team_id}/top-donators/`

Возвращает топ-5 донатеров указанной команды.

**Query Parameters:**
- `limit` (optional, default: 5, max: 10) - количество донатеров

**Response:**
```json
{
  "team_id": 1,
  "team_name": "PilotStorm",
  "donators": [
    {
      "user_id": 1001,
      "username": "xShadow",
      "total_points": 15000,
      "rank": 1
    },
    {
      "user_id": 1002,
      "username": "ДимаFire",
      "total_points": 12000,
      "rank": 2
    },
    {
      "user_id": 1003,
      "username": "AnnaCraft",
      "total_points": 8500,
      "rank": 3
    },
    {
      "user_id": 1004,
      "username": "PavelPro",
      "total_points": 6200,
      "rank": 4
    },
    {
      "user_id": 1005,
      "username": "SanyaWolf",
      "total_points": 4800,
      "rank": 5
    }
  ],
  "updated_at": "2025-01-15T14:30:00Z"
}
```

**Status Codes:**
- `200 OK` - успешно
- `404 Not Found` - команда не найдена

---

### 4. Получение ленты покупок

**GET** `/api/battles/{event_id}/feed/`

Возвращает последние покупки в рамках события.

**Query Parameters:**
- `limit` (optional, default: 12, max: 50) - количество записей
- `offset` (optional, default: 0) - смещение для пагинации
- `team_id` (optional) - фильтр по команде

**Response:**
```json
{
  "feed": [
    {
      "id": 1001,
      "team_id": 1,
      "team_name": "PilotStorm",
      "team_color": "#e84057",
      "streamer_code": "STORM",
      "buyer_name": "xShadow",
      "amount": 1500,
      "purchased_at": "2025-01-15T14:25:30Z"
    },
    {
      "id": 1002,
      "team_id": 2,
      "team_name": "PilotVortex",
      "team_color": "#3079ff",
      "streamer_code": "VORTEX",
      "buyer_name": "ДимаFire",
      "amount": 2000,
      "purchased_at": "2025-01-15T14:24:15Z"
    }
  ],
  "total": 1250,
  "limit": 12,
  "offset": 0,
  "has_more": true
}
```

**Status Codes:**
- `200 OK` - успешно
- `404 Not Found` - событие не найдено

---

### 5. Получение статистики пользователя

**GET** `/api/battles/{event_id}/my-stats/`

Возвращает статистику текущего пользователя в событии.

**Response:**
```json
{
  "user_id": 1001,
  "username": "xShadow",
  "total_contributed": 15000,
  "team_id": 1,
  "team_name": "PilotStorm",
  "my_rank_in_team": 1,
  "purchases_count": 12,
  "last_purchase_at": "2025-01-15T14:25:30Z"
}
```

**Status Codes:**
- `200 OK` - успешно
- `401 Unauthorized` - пользователь не аутентифицирован
- `404 Not Found` - событие не найдено или пользователь не участвует

---

### 6. WebSocket для обновлений в реальном времени

**WS** `/ws/battles/{event_id}/`

WebSocket соединение для получения обновлений в реальном времени.

**Подписки:**
- `leaderboard` - обновления рейтинга команд
- `feed` - новые покупки
- `team_{team_id}` - обновления конкретной команды

**Сообщения от сервера:**

**Обновление рейтинга:**
```json
{
  "type": "leaderboard_update",
  "data": {
    "teams": [
      {
        "team_id": 1,
        "total_points": 125500,
        "position": 1
      },
      {
        "team_id": 2,
        "total_points": 98100,
        "position": 2
      }
    ],
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Новая покупка:**
```json
{
  "type": "new_purchase",
  "data": {
    "id": 1003,
    "team_id": 1,
    "team_name": "PilotStorm",
    "team_color": "#e84057",
    "streamer_code": "STORM",
    "buyer_name": "MaxStorm",
    "amount": 3000,
    "purchased_at": "2025-01-15T14:30:15Z"
  }
}
```

**Обновление топ донатеров:**
```json
{
  "type": "top_donators_update",
  "data": {
    "team_id": 1,
    "donators": [
      {
        "user_id": 1001,
        "username": "xShadow",
        "total_points": 15000,
        "rank": 1
      }
    ]
  }
}
```

---

## Интеграция с существующими модулями

### Обработка покупок

При создании заказа с кодом стримера автоматически начисляются очки команде:

```python
# market/streamers/services/streamers.py (дополнение)

def try_to_create_nested_streamer_donation(
    self,
    donation: NestedStreamerDonation,
    streamer_id: StreamerId | AffiseStreamerId,
) -> None:
    # ... существующий код ...
    
    # НОВОЕ: Начислить очки команде
    if isinstance(streamer, Streamer):
        order = Order.objects.get(id=donation.order_id)
        battle_scoring_service = self.ns.battles.battle_scoring_service
        battle_scoring_service.process_order_for_battle(
            order, 
            SecretCode(streamer.secret_code)
        )
```

### Модели данных

```python
# market/battles/models/battle_event.py
class BattleEvent(IntPkModel):
    game = ForeignKey("products.game", on_delete=CASCADE)
    name = CharField(max_length=200)
    description = TextField()
    start_date = DateTimeField()
    end_date = DateTimeField()
    is_active = BooleanField(default=True)
    team_count = PositiveSmallIntegerField(default=2)
    prizes_config = JSONField(default=dict)

# market/battles/models/battle_team.py
class BattleTeam(IntPkModel):
    battle_event = ForeignKey(BattleEvent, on_delete=CASCADE, related_name="teams")
    streamer = ForeignKey(Streamer, on_delete=CASCADE)
    name = CharField(max_length=100)
    position = PositiveSmallIntegerField()
    color = CharField(max_length=7)

# market/battles/models/battle_team_score.py
class BattleTeamScore(IntPkModel):
    battle_team = ForeignKey(BattleTeam, on_delete=CASCADE, related_name="scores")
    order = ForeignKey("orders.Order", on_delete=CASCADE)
    user = ForeignKey("users.User", on_delete=CASCADE)
    points = DecimalField(max_digits=16, decimal_places=2)
    created_at = DateTimeField(auto_now_add=True)
```

---

## Кэширование

Для оптимизации производительности рекомендуется кэширование:

- **Рейтинг команд**: кэш на 5-10 секунд (Redis)
- **Топ донатеров**: кэш на 30 секунд
- **Лента покупок**: кэш на 2-5 секунд
- **Информация о событии**: кэш на 1 минуту

---

## Пагинация

Для endpoints с большим объемом данных используется курсорная пагинация:

```json
{
  "results": [...],
  "next": "http://api.example.com/api/battles/1/feed/?cursor=abc123",
  "previous": null,
  "count": 1250
}
```

---

## Обработка ошибок

Стандартный формат ошибок:

```json
{
  "error": {
    "code": "BATTLE_NOT_FOUND",
    "message": "Событие с ID 123 не найдено",
    "details": {}
  }
}
```

**Коды ошибок:**
- `BATTLE_NOT_FOUND` - событие не найдено
- `BATTLE_INACTIVE` - событие неактивно
- `TEAM_NOT_FOUND` - команда не найдена
- `INVALID_STREAMER_CODE` - неверный код стримера
- `ORDER_NOT_ELIGIBLE` - заказ не подходит для начисления очков

---

## Rate Limiting

- Публичные endpoints: 100 запросов/минуту
- Аутентифицированные endpoints: 200 запросов/минуту
- WebSocket: без ограничений (но с валидацией подписок)

---

## Версионирование

API версионируется через URL:
- `/api/v1/battles/` - текущая версия
- `/api/v2/battles/` - будущие версии

---

## Примеры использования

### Получение данных события и рейтинга

```javascript
// Получение информации о событии
const eventResponse = await fetch('/api/battles/1/');
const eventData = await eventResponse.json();

// Получение рейтинга
const leaderboardResponse = await fetch('/api/battles/1/leaderboard/');
const leaderboardData = await leaderboardResponse.json();

// Обновление UI
updateTeams(leaderboardData.teams);
```

### WebSocket подключение

```javascript
const ws = new WebSocket('ws://api.example.com/ws/battles/1/');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch(message.type) {
    case 'leaderboard_update':
      updateLeaderboard(message.data.teams);
      break;
    case 'new_purchase':
      addToFeed(message.data);
      break;
    case 'top_donators_update':
      updateTopDonators(message.data);
      break;
  }
};

// Подписка на обновления
ws.send(JSON.stringify({
  action: 'subscribe',
  channels: ['leaderboard', 'feed']
}));
```

---

## Безопасность

1. **Валидация данных**: все входные данные валидируются
2. **SQL Injection**: использование ORM Django предотвращает SQL инъекции
3. **XSS**: санитизация всех пользовательских данных
4. **CSRF**: защита через Django CSRF middleware
5. **Rate Limiting**: ограничение частоты запросов
6. **Аутентификация**: проверка прав доступа для каждого endpoint

---

## Мониторинг и логирование

- Логирование всех покупок и начислений очков
- Метрики производительности (response time, throughput)
- Алерты при ошибках обработки покупок
- Дашборд с активностью события в реальном времени

---

## Тестирование

Рекомендуемые тесты:
- Unit тесты для сервисов подсчета очков
- Integration тесты для API endpoints
- E2E тесты для полного flow покупки → начисление очков
- Load тесты для WebSocket соединений

