import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio dio = Dio(BaseOptions(
    baseUrl: "http://10.0.2.2:5002/api/v1", // IP padrão do emulador Android
    connectTimeout: const Duration(seconds: 5),
  ));

  final _storage = const FlutterSecureStorage();

  ApiClient() {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Antes de QUALQUER requisição, ele busca o token no "cofre"
        String? token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }
}