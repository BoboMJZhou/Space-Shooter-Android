using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour {
    private Rigidbody rb;
    public float speed;
    bool currentisAndroid = false;
    private void Start()
    {
        rb = GetComponent<Rigidbody>();
#if UNITY_EDITOR
        currentisAndroid = false;
#else
        currentisAndroid = true;
#endif
    }

    private void FixedUpdate()
    {
        if(currentisAndroid)
        {
            if (Input.GetTouch(0).position.x < Screen.width / 2 && Input.GetTouch(0).phase == TouchPhase.Stationary)
                MoveLeft();
            else if (Input.GetTouch(0).position.x > Screen.width / 2 && Input.GetTouch(0).phase == TouchPhase.Stationary)
                MoveRight();
            else
                MoveStop();
        }
        else
        {
            float moveHorizontal = Input.GetAxis("Horizontal");
            float moveVertical = Input.GetAxis("Vertical");

            Vector3 movement = new Vector3(moveHorizontal, 0.0f, moveVertical);
            rb.velocity = movement * speed;
        }
        
    }

    private void MoveLeft()
    {
        Vector3 movement = new Vector3(-1, 0.0f, 0.0f);
        rb.velocity = movement * speed;
    }

    private void MoveRight()
    {
        Vector3 movement = new Vector3(1, 0.0f, 0.0f);
        rb.velocity = movement * speed;
    }

    private void MoveStop()
    {
        Vector3 movement = new Vector3(0.0f, 0.0f, 0.0f);
        rb.velocity = movement * speed;
    }
}
