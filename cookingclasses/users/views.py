from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from .models import CustomUser
from .serializers import CustomUserSerializer, RegisterSerializer
from rest_framework.views import APIView

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(
            {"user": CustomUserSerializer(user).data}, status=status.HTTP_201_CREATED
        )

class LoginView(generics.GenericAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response(
                {"user": CustomUserSerializer(user).data}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response(status=status.HTTP_205_RESET_CONTENT)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        CustomUser.objects.filter(id=user.id).update(
            username=serializer.validated_data.get('username', user.username),
            email=serializer.validated_data.get('email', user.email),
            first_name=serializer.validated_data.get('first_name', user.first_name),
            last_name=serializer.validated_data.get('last_name', user.last_name),
            image=serializer.validated_data.get('image', user.image)
        )
        updated_user = CustomUser.objects.get(id=user.id)
        return Response(CustomUserSerializer(updated_user).data)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = CustomUser.objects.filter(id=request.user.id).values(
            'id', 'username', 'email', 'first_name', 'last_name', 'image', 'date_joined', 'is_staff'
        ).first()
        return Response(user_data)

class DeleteProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        CustomUser.objects.filter(id=user.id).delete()
        logout(request)
        return Response({"message": "Profile deleted successfully"}, status=status.HTTP_204_NO_CONTENT)